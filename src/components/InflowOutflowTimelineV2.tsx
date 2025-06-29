import React, { useRef, useEffect, useState } from "react";
import { Grid, Tooltip, ActionIcon } from '@mantine/core';
import { IconPlayerPlayFilled, IconPlayerPauseFilled } from "@tabler/icons-react";
import ab_dates from '../assets/abundance_dates.json';
import mv_dates from '../assets/movement_dates.json';

const datasets = [ab_dates, mv_dates, ab_dates, ab_dates];
const dateLabels = datasets.map(ds => ds.map((info: any) => info.label));

const WEEKS = 52;
const SPAN = 20;

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
  value?: number;
  onChange?: (week: number) => void;
  mode: Mode;
  dateLabels: string[][];
  dataIndex: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function InflowOutflowTimelineV2({
  value,
  onChange,
  mode,
  dateLabels,
  dataIndex,
  className,
  style
}: Props) {
  const [internalWeek, setInternalWeek] = useState(0);
  const week = value !== undefined ? value : internalWeek;
  const setWeek = onChange ? onChange : setInternalWeek;

  const [isPlaying, setIsPlaying] = useState(false);
  const playbackRef = useRef<NodeJS.Timeout | null>(null);
  const [markerWeek, setMarkerWeek] = useState(week);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setWeek((week + 1) % WEEKS);
      if (e.key === "ArrowLeft") setWeek((week - 1 + WEEKS) % WEEKS);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [week, setWeek]);

  useEffect(() => {
    if (isPlaying) {
      setMarkerWeek(week);
      let current = week;
      playbackRef.current = setInterval(() => {
        current = (current + 1) % WEEKS;
        setMarkerWeek(current);
        if (current === (week + SPAN) % WEEKS) {
          clearInterval(playbackRef.current!);
          setIsPlaying(false);
        }
      }, 400);
    } else {
      setMarkerWeek(week);
      if (playbackRef.current) clearInterval(playbackRef.current);
    }
    return () => {
      if (playbackRef.current) clearInterval(playbackRef.current);
    };
  }, [isPlaying, week]);

  const handleDoubleClick = () => setWeek(0);

  const trackRef = useRef<HTMLDivElement>(null);
  const handleThumbDrag = (e: React.MouseEvent | React.TouchEvent) => {
    const move = (clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      let x = clamp(clientX - rect.left, 0, rect.width);
      let w = Math.round((x / rect.width) * (WEEKS - 1));
      setWeek(w);
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

  const percent = (week / (WEEKS - 1)) * 100;
  const spanStart = week;
  const spanEnd = (week + SPAN) % WEEKS;
  const isWrapped = spanEnd < spanStart;
  const leftPct = (spanStart / (WEEKS - 1)) * 100;
  const rightPct = (spanEnd / (WEEKS - 1)) * 100;
  const markerPct = (markerWeek / (WEEKS - 1)) * 100;

  return (
    <div className={`Timeline ${className || ''}`} style={style}>
      <Grid align="stretch">
        <Tooltip label={isPlaying ? "Pause" : "Play"}>
          <ActionIcon
            size="xl"
            onClick={() => setIsPlaying(p => !p)}
            variant={isPlaying ? 'filled' : 'default'}
          >
            {isPlaying ? <IconPlayerPauseFilled /> : <IconPlayerPlayFilled />}
          </ActionIcon>
        </Tooltip>
        <Grid.Col span={11}>
          <div style={{ position: 'relative', height: 25, zIndex: 1000 }}>
            <div
              className="slider-button"
              style={{
                position: 'absolute',
                left: `calc(${markerPct}% - 8px)`,
                top: 0,
                pointerEvents: 'none',
              }}
            >
              <div style={{ backgroundColor: 'white', padding: '3px' }}>
                {dateLabels[dataIndex]?.[markerWeek]}
              </div>
              <div style={{ backgroundColor: 'black', width: 3, height: 23 }} />
            </div>
          </div>

          <div
            ref={trackRef}
            onDoubleClick={handleDoubleClick}
            style={{
              position: 'relative',
              height: 24,
              background: '#dee2e6',
              borderRadius: 8,
              border: '1px solid #bbb',
              userSelect: 'none',
            }}
          >
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
                }}
              />
            )}

            {monthMarks.map(mark => (
              <div
                key={mark.week}
                style={{
                  position: 'absolute',
                  left: `calc(${(mark.week / (WEEKS - 1)) * 100}% - 2px)`,
                  top: 6,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'white',
                  border: '1.5px solid #228be6',
                  zIndex: 2,
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 12,
                    color: 'black',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {mark.label}
                </span>
              </div>
            ))}

            {/* Thumbs: **match V1 CSS & look** */}
            {mode === 'inflow' ? (
              <>
                {/* Left: static filled circle */}
                <div
                  style={{
                    position: 'absolute',
                    left: `calc(${leftPct}% - 14px)`,
                    top: 2,
                    width: 28,
                    height: 28,
                    zIndex: 3,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width={28} height={28}>
                    <circle cx={14} cy={14} r={10} fill="#228be6" stroke="#228be6" strokeWidth={2} />
                  </svg>
                </div>

                {/* Right: draggable hollow arrow */}
                <div
                  style={{
                    position: 'absolute',
                    left: `calc(${rightPct}% - 14px)`,
                    top: 2,
                    width: 28,
                    height: 28,
                    zIndex: 4,
                    cursor: isPlaying ? 'not-allowed' : 'pointer',
                    pointerEvents: isPlaying ? 'none' : 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseDown={handleThumbDrag}
                  onTouchStart={e => {
                    e.preventDefault();
                    handleThumbDrag(e);
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24">
                    <path
                      d="M0 0 L0 24 L20 12 Z"
                      fill="white"
                      stroke="#228be6"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </>
            ) : (
              <>
                {/* Left: static hollow arrow */}
                <div
                  style={{
                    position: 'absolute',
                    left: `calc(${leftPct}% - 14px)`,
                    top: 2,
                    width: 28,
                    height: 28,
                    zIndex: 3,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24">
                    <path
                      d="M0 0 L0 24 L20 12 Z"
                      fill="white"
                      stroke="#228be6"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* Right: draggable filled circle */}
                <div
                  style={{
                    position: 'absolute',
                    left: `calc(${rightPct}% - 14px)`,
                    top: 2,
                    width: 28,
                    height: 28,
                    zIndex: 4,
                    cursor: isPlaying ? 'not-allowed' : 'pointer',
                    pointerEvents: isPlaying ? 'none' : 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseDown={handleThumbDrag}
                  onTouchStart={e => {
                    e.preventDefault();
                    handleThumbDrag(e);
                  }}
                >
                  <svg width={28} height={28}>
                    <circle cx={14} cy={14} r={10} fill="white" stroke="#228be6" strokeWidth={3} />
                  </svg>
                </div>
              </>
            )}
          </div>
        </Grid.Col>
      </Grid>
    </div>
  );
}
