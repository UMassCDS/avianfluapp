import React, { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Tooltip, ActionIcon } from '@mantine/core';
import { useMove } from '@mantine/hooks';
import { IconPlayerPlayFilled, IconPlayerPauseFilled } from "@tabler/icons-react";
import { RootState } from '../store/store';
import { clearOverlayUrl, clearFlowResults } from '../store/slices/mapSlice';
import {MAX_WEEK, WEEKS_PER_YEAR, getTimelinePosition, monthMarks} from '../utils/utils'


const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

const isWithinSpan = (week: number, start: number, end: number, wrapped: boolean) => {
  return wrapped ? week >= start || week <= end : week >= start && week <= end;
};

const isNear = (a: number, b: number, range: number = 2, max: number = MAX_WEEK) => {
  const diff = Math.abs(a - b);
  return diff <= range || (max - diff) <= range;
}

type Mode = "inflow" | "outflow";

export interface DatasetItem {
  index: number;
  date: string; // format: YYYY-MM-DD
  label: string; // e.g., "Jan 7"
}

interface Props {
  onChangeWeek: (week: number) => void;
  mode: Mode;
  dataset: DatasetItem[];
  nFlowWeeks: number;
}

export default function InflowOutflowTimelineV2({
  onChangeWeek,
  mode,
  dataset,
  nFlowWeeks,
}: Props) {
  const dispatch = useDispatch();

  const week = useSelector((state: RootState) => state.timeline.week);
  const isMonitor = useSelector((state: RootState) => state.ui.isMonitor);
  const flowResults = useSelector((state: RootState) => state.map.flowResults);

  const localNFlowWeeks = nFlowWeeks - 1;
  const playbackRef = useRef<NodeJS.Timeout | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [markerWeek, setMarkerWeek] = useState(week);
  const [spanStart, setSpanStart] = useState(week);
  const [spanEnd, setSpanEnd] = useState((week + localNFlowWeeks) % WEEKS_PER_YEAR);
  const [isWrapped, setIsWrapped] = useState(false);
  const [leftPct, setLeftPct] = useState(0);
  const [rightPct, setRightPct] = useState(0);
  const [markerPct, setMarkerPct] = useState(0);
  const [sliderMarks, setSliderMarks] = useState(monthMarks);
  const [showSpanLabels, setShowSpanLabels] = useState(false);

  const updateMarkerAndSpan = () => {
    const spanEnd = (spanStart + localNFlowWeeks) % WEEKS_PER_YEAR;
    const wrapped = spanEnd < spanStart;
    const current = mode === 'inflow' ? spanEnd : spanStart;

    setSpanEnd(spanEnd);
    setIsWrapped(wrapped);
    setLeftPct(getTimelinePosition(dataset[spanStart].date));
    setRightPct(getTimelinePosition(dataset[spanEnd].date));
    onChangeWeek(current);
  };

  const startPlayback = () => {
    let current = markerWeek;

    playbackRef.current = setInterval(() => {
      current = (current + 1) % WEEKS_PER_YEAR;
      if (!isWithinSpan(current, spanStart, spanEnd, isWrapped)) current = spanStart;
      setMarkerWeek(current);
      onChangeWeek(current);
    }, 400);
  };

  const stopPlayback = () => {
    if (playbackRef.current) clearInterval(playbackRef.current);
  };

  const handleThumbDrag = (clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = clamp(clientX - rect.left, 0, rect.width);
    const weekNum = Math.round((x / rect.width) * (WEEKS_PER_YEAR - 1));

    const start = mode === "inflow"
      ? (weekNum - localNFlowWeeks + WEEKS_PER_YEAR) % WEEKS_PER_YEAR
      : weekNum;

    const current = mode === "inflow" ? weekNum : start;

    setSpanStart(start);
    setMarkerWeek(current);
    onChangeWeek(current);

    dispatch(clearFlowResults());
    dispatch(clearOverlayUrl());
  };

  const setupDragHandlers = (e: React.MouseEvent | React.TouchEvent) => {
    const moveHandler = (ev: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in ev ? ev.touches[0].clientX : ev.clientX;
      handleThumbDrag(clientX);
    };
    const release = () => {
      window.removeEventListener("mousemove", moveHandler);
      window.removeEventListener("touchmove", moveHandler);
      window.removeEventListener("mouseup", release);
      window.removeEventListener("touchend", release);
    };
    window.addEventListener("mousemove", moveHandler);
    window.addEventListener("touchmove", moveHandler);
    window.addEventListener("mouseup", release);
    window.addEventListener("touchend", release);
  };

  const { ref } = useMove(({ x }) => {
    const curWeek = Math.floor(x * (WEEKS_PER_YEAR - 1));
    setMarkerWeek(curWeek);
    if (flowResults.length > 0) onChangeWeek(curWeek);
  });

  useEffect(updateMarkerAndSpan, [spanStart]);

  useEffect(() => {
    setMarkerPct(getTimelinePosition(dataset[markerWeek].date));
  }, [markerWeek]);

  useEffect(() => {
    setSliderMarks(isMonitor ? monthMarks : []);
  }, [isMonitor]);

  useEffect(() => {
    const spanEnd = (spanStart + localNFlowWeeks) % WEEKS_PER_YEAR;
    const current = mode === 'inflow' ? spanEnd : spanStart;
    if (flowResults.length === 0) onChangeWeek(current);
    else setMarkerWeek(current);
  }, [flowResults, spanStart]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        const next = (week + 1) % WEEKS_PER_YEAR;
        onChangeWeek(next);
        setMarkerWeek(next);
      }
      if (e.key === "ArrowLeft") {
        const prev = (week - 1 + WEEKS_PER_YEAR) % WEEKS_PER_YEAR;
        onChangeWeek(prev);
        setMarkerWeek(prev);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [week]);

  useEffect(() => {
    if (isPlaying) startPlayback();
    else stopPlayback();
    return stopPlayback;
  }, [isPlaying, markerWeek, spanStart, isWrapped]);

  return (
    <div
      className="Timeline"
      onMouseEnter={() => setShowSpanLabels(true)}
      onMouseLeave={() => setShowSpanLabels(false)}
    >
      <div className="flex items-center w-full">
        {/* Play/Pause Button */}
        <div className="flex-shrink-0 mr-2" style={{ width: 48 }}>
        <Tooltip label="No flow results to play" disabled={flowResults.length > 0}>
          <Tooltip label={isPlaying ? "Pause" : "Play"} disabled={flowResults.length === 0}>
            <ActionIcon
              size="xl"
              onClick={() => setIsPlaying(p => !p)}
              variant={flowResults.length === 0 ? 'default' : 'filled'}
              disabled={flowResults.length === 0}
              style={{ width: 48, height: 48 }}
            >
              {isPlaying ? <IconPlayerPauseFilled /> : <IconPlayerPlayFilled />}
            </ActionIcon>
          </Tooltip>
        </Tooltip>
        </div>
        {/* Timeline Slider Area */}
        <div className="flex-1" style={{marginLeft: "5%"}}>
          {/* Thumb label and marker */}
          <div ref={ref} style={{ height: 32, position: 'relative', zIndex: 1000 }}>
            <div
              className="timeline-marker"
              style={{
                position: 'absolute',
                left: `calc(${markerPct}% - 40px)`,
                top: 0,
                cursor: 'pointer',
              }}
            >
              <div className="timeline-marker-label">
                {dataset[markerWeek].label}
              </div>
            </div>
            <div
              className="timeline-marker-dot"
              style={{
                position: 'absolute',
                left: `calc(${markerPct}% - 3px)`,
                top: '30px',
              }}
            />
            <div
              className="timeline-today-marker"
              style={{
                left: `calc(${getTimelinePosition(new Date())}% - 2px)`,
              }}
            />
          </div>
          {/* Custom Slider */}
          <div
            ref={trackRef}
            style={{
              position: 'relative',
              height: 10,
              background: '#dee2e6',
              borderRadius: 8,
              border: '1px solid #bbb',
              userSelect: 'none',
              marginTop: 0,
              marginBottom: 0,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {/* Filled bar */}
            {isWrapped ? (
              <>
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    width: `${rightPct}%`,
                    top: 0,
                    bottom: 0,
                    background: '#228be6',
                    zIndex: 1,
                    borderRadius: 8,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: `${leftPct}%`,
                    width: `${100 - leftPct}%`,
                    top: 0,
                    bottom: 0,
                    background: '#228be6',
                    zIndex: 1,
                    borderRadius: 8,
                  }}
                />
              </>
            ) : (
              <div
                style={{
                  position: 'absolute',
                  left: `${leftPct}%`,
                  width: `${rightPct - leftPct}%`,
                  top: 0,
                  bottom: 0,
                  background: '#228be6',
                  zIndex: 1,
                  borderRadius: 8,
                }}
              />
            )}

            {/* Month marks and labels */}
            {sliderMarks.map((mark, idx) => {
              let labelStyle: React.CSSProperties = {
                position: 'absolute',
                top: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 12,
                color: 'gray',
                fontWeight: 500,
                whiteSpace: 'nowrap',
              };
              if (idx === 0) {
                labelStyle.left = 0;
                labelStyle.transform = 'none';
                labelStyle.textAlign = 'left';
              } else if (idx === sliderMarks.length - 1) {
                labelStyle.left = '100%';
                labelStyle.transform = 'translateX(-100%)';
                labelStyle.textAlign = 'right';
              }
              return (
                <div
                  key={mark.label}
                  style={{
                    position: 'absolute',
                    left: `calc(${mark.value}% - 3px)`,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'white',
                    border: '1.5px solid #228be6',
                    zIndex: 2,
                  }}
                >
                  <span style={labelStyle}>{mark.label}</span>
                </div>
              );
            })}

            {/* Thumbs: static blue circle (left) and blue arrow (right) */}
            {/* LEFT (circle) */}
            <div
              style={{
                position: 'absolute',
                left: `calc(${leftPct}% - 14px)`,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 28,
                height: 28,
                zIndex: mode === 'outflow' ? 3 : 2,
                pointerEvents: 'none',
              }}
            >
              {showSpanLabels && !isNear(spanStart, markerWeek)  && (
                <div
                  className="timeline-label"
                  style={{
                    position: 'absolute',
                    top: -28,
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }}
                >
                  {dataset[spanStart].label}
                </div>
              )}
              <svg width={28} height={28}>
                <circle cx={14} cy={14} r={10} fill="#228be6" stroke="#228be6" strokeWidth={3} />
              </svg>
            </div>

            {/* RIGHT (arrow) */}
            <div
              style={{
                position: 'absolute',
                left: `calc(${rightPct}% - 14px)`,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 28,
                height: 28,
                zIndex: mode === 'inflow' ? 3 : 2,
                pointerEvents: 'none',
              }}
            >
              {showSpanLabels && !isNear(spanEnd, markerWeek) && (
                <div
                  className="timeline-label"
                  style={{
                    position: 'absolute',
                    top: -28,
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }}
                >
                  {dataset[spanEnd].label}
                </div>
              )}
              <svg width="28" height="28" viewBox="0 0 24 24">
                <polygon
                  points="6,6 22,12 6,18"
                  fill="#228be6"
                  stroke="#228be6"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Draggable: white arrow for inflow, white circle for outflow */}
            {mode === 'inflow' ? (
              <div
                style={{
                  position: 'absolute',
                  left: `calc(${rightPct}% - 14px)`,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 28,
                  height: 28,
                  zIndex: 4,
                  cursor: !isPlaying ? 'pointer' : 'default',
                  pointerEvents: !isPlaying ? 'auto' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseDown={!isPlaying ? setupDragHandlers : undefined}
                onTouchStart={!isPlaying ? (e => { e.preventDefault(); setupDragHandlers(e); }) : undefined}
              >
                <svg width="28" height="28" viewBox="0 0 24 24">
                  <polygon
                    points="6,6 22,12 6,18"
                    fill="white"
                    stroke="#228be6"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            ) : (
              <div
                style={{
                  position: 'absolute',
                  left: `calc(${leftPct}% - 14px)`,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 28,
                  height: 28,
                  zIndex: 4,
                  cursor: !isPlaying ? 'pointer' : 'default',
                  pointerEvents: !isPlaying ? 'auto' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseDown={!isPlaying ? setupDragHandlers : undefined}
                onTouchStart={!isPlaying ? (e => { e.preventDefault(); setupDragHandlers(e); }) : undefined}
              >
                <svg width={28} height={28}>
                  <circle cx={14} cy={14} r={10} fill="white" stroke="#228be6" strokeWidth={3} />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
