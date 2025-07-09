import React, { useRef, useEffect, useState,  } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Grid, Tooltip, ActionIcon } from '@mantine/core';
import { useMove } from '@mantine/hooks';
import { IconPlayerPlayFilled, IconPlayerPauseFilled } from "@tabler/icons-react";
import { RootState } from '../store/store';
import { clearOverlayUrl, clearFlowResults } from '../store/slices/mapSlice';
import ab_dates from '../assets/abundance_dates.json';
import mv_dates from '../assets/movement_dates.json';
import {WEEKS_PER_YEAR} from '../utils/utils'

const datasets = [ab_dates, mv_dates, ab_dates, ab_dates];
const dateLabels = datasets.map(ds => ds.map((info: any) => info.label));

const monthMarks = [
  { week: 0, label: 'Jan' }, { week: 4, label: 'Feb' }, { week: 8, label: 'Mar' },
  { week: 13, label: 'Apr' }, { week: 17, label: 'May' }, { week: 21, label: 'Jun' },
  { week: 26, label: 'Jul' }, { week: 30, label: 'Aug' }, { week: 35, label: 'Sep' },
  { week: 39, label: 'Oct' }, { week: 43, label: 'Nov' }, { week: 47, label: 'Dec' }
];

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

type Mode = "inflow" | "outflow";

interface Props {
  onChangeWeek: (week: number) => void;
  mode: Mode;
  dateLabels: string[][];
  dataIndex: number;
  nFlowWeeks: number;
}

export default function InflowOutflowTimelineV2({
  onChangeWeek,
  mode,
  dateLabels,
  dataIndex,
  nFlowWeeks,
}: Props) {
  const dispatch = useDispatch();

  const week = useSelector((state: RootState) => state.timeline.week);
  const isMonitor = useSelector((state: RootState) => state.ui.isMonitor);
  const flowResults = useSelector((state: RootState) => state.map.flowResults);

  const playbackRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [markerWeek, setMarkerWeek] = useState<number>(week);
  const [sliderMarks, setSliderMarks] = useState(monthMarks);
  const [spanStart, setSpanStart] = useState<number>(week);
  const [isWrapped, setIsWrapped] = useState<boolean>(false);
  const [leftPct, setLeftPct] = useState<number>(0);
  const [rightPct, setRightPct] = useState<number>(0);
  const [markerPct, setMarkerPct] = useState<number>(0);

  // needs to be decreased by 1 so that the data received from the backend is displayed correctly 
  // (exactly nFlowWeeks records come from the backend, but nFlowWeeks + 1 are displayed here)
  const localNFlowWeeks = nFlowWeeks - 1;

  // marker ref
  const { ref } = useMove(({ x }) => {
    const curWeek = Math.floor(x * (WEEKS_PER_YEAR - 1));
    setMarkerWeek(curWeek)
    if (flowResults.length > 0) {
      onChangeWeek(curWeek);
    };
  });

  useEffect(() => {
    const spanEnd = (spanStart + localNFlowWeeks) % WEEKS_PER_YEAR;
    const isWrapped = spanEnd < spanStart;
    const curWeek = mode === 'inflow' ? spanEnd : spanStart;
  
    onChangeWeek(curWeek);
    setIsWrapped(isWrapped);
    setLeftPct((spanStart / (WEEKS_PER_YEAR - 1)) * 100);
    setRightPct((spanEnd / (WEEKS_PER_YEAR - 1)) * 100);
  }, [spanStart]);

  useEffect(() => {
    setMarkerPct((markerWeek / (WEEKS_PER_YEAR - 1)) * 100);
  }, [markerWeek]);

  useEffect(() => {
    setSliderMarks(isMonitor ? monthMarks : [])
  }, [monthMarks, isMonitor]);

  useEffect(() => {
      const spanEnd = (spanStart + localNFlowWeeks) % WEEKS_PER_YEAR;
      const curWeek = mode === 'inflow' ? spanEnd : spanStart;
    if (flowResults.length === 0) {
      onChangeWeek(curWeek)
    } else {
      setMarkerWeek(curWeek)
    }
  }, [flowResults, spanStart]);


  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        const nextWeek = (week + 1) % WEEKS_PER_YEAR;
        onChangeWeek(nextWeek);
        setMarkerWeek(nextWeek);
      };
      if (e.key === "ArrowLeft") {
        const prewWeek = (week - 1) % WEEKS_PER_YEAR;
        onChangeWeek(prewWeek);
        setMarkerWeek(prewWeek);
      };
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [week, onChangeWeek]);

  useEffect(() => {
    const spanEnd = (spanStart + localNFlowWeeks) % WEEKS_PER_YEAR;

    const isWithinSpan = (week: number) => {
      if (!isWrapped) return week >= spanStart && week <= spanEnd;
      return week >= spanStart || week <= spanEnd;
    };

    if (isPlaying) {
      let current = markerWeek; // Resume from current marker position
      playbackRef.current = setInterval(() => {
        current = (current + 1) % WEEKS_PER_YEAR;

        // Wrap to spanStart if passed spanEnd
        if (!isWithinSpan(current)) {
          current = spanStart;
        }

        setMarkerWeek(current);
        onChangeWeek(current);
      }, 400);
    } else {
      if (playbackRef.current) clearInterval(playbackRef.current);
    }

    return () => {
      if (playbackRef.current) clearInterval(playbackRef.current);
    };
  }, [isPlaying, markerWeek, spanStart, isWrapped]);



  const handleDoubleClick = () => onChangeWeek(0);

  const trackRef = useRef<HTMLDivElement>(null);
  const handleThumbDrag = (e: React.MouseEvent | React.TouchEvent) => {
    const move = (clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      let x = clamp(clientX - rect.left, 0, rect.width);
      let w = Math.round((x / rect.width) * (WEEKS_PER_YEAR - 1));
      let start;
      let curWeek;
  
      if (mode === "inflow") {
        // Dragging the arrow (right): end is w, start wraps around
        let end = w;
        start = (end - localNFlowWeeks + WEEKS_PER_YEAR) % WEEKS_PER_YEAR;
        curWeek = end;
      } else {
        // Dragging the circle (left): start is w, end wraps around
        start = w;
        curWeek = start;
      }
      setSpanStart(start);
      setMarkerWeek(curWeek);
      onChangeWeek(curWeek);

      dispatch(clearFlowResults());
      dispatch(clearOverlayUrl());
    };
    const moveHandler = (ev: MouseEvent | TouchEvent) => {
      if ("touches" in ev) move(ev.touches[0].clientX);
      else move(ev.clientX);
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

  return (
    <div className="Timeline">
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
          <div
            ref={ref}
            style={{ height: 25, position: 'relative', zIndex: 1000 }}>
            <div
              className='slider-button'
              style={{
                position: 'absolute',
                left: `calc(${markerPct}% - 8px)`,
                top: 0,
              }}>
              <div style={{ backgroundColor: "white", padding: "3px" }}>
                {dateLabels[dataIndex]?.[markerWeek]}
              </div>
            </div>
          </div>
          {/* Custom Slider */}
          <div
            ref={trackRef}
            onDoubleClick={handleDoubleClick}
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
              const markPct = (mark.week / (WEEKS_PER_YEAR - 1)) * 100;
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
                  key={mark.week}
                  style={{
                    position: 'absolute',
                    left: `calc(${markPct}% - 3px)`,
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width={28} height={28}>
                <circle cx={14} cy={14} r={10} fill="#228be6" stroke="#228be6" strokeWidth={3} />
              </svg>
            </div>
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
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
                onMouseDown={!isPlaying ? handleThumbDrag : undefined}
                onTouchStart={!isPlaying ? (e => { e.preventDefault(); handleThumbDrag(e); }) : undefined}
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
                onMouseDown={!isPlaying ? handleThumbDrag : undefined}
                onTouchStart={!isPlaying ? (e => { e.preventDefault(); handleThumbDrag(e); }) : undefined}
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
