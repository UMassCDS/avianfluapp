import React, { useMemo, useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useMove } from '@mantine/hooks';
import { RootState } from '../../store/store';
import { clearOverlayUrl, clearFlowResults } from '../../store/slices/mapSlice';
import {MAX_WEEK, WEEKS_PER_YEAR, getTimelinePosition, monthMarks} from '../../utils/utils'
import { dataInfo } from '../../hooks/dataUrl';
import ab_dates from '../../assets/abundance_dates.json';
import mv_dates from '../../assets/movement_dates.json';

import { PlayPauseButton } from './PlayPauseButton';
import { TimelineMarkerLabel } from './TimelineMarkerLabel';
import { TimelineMarkerDot } from './TimelineMarkerDot';
import { TimelineTodayMarker } from './TimelineTodayMarker';
import { TimelineMonthMark } from './TimelineMonthMark';
import { TimelineFilledBar } from './TimelineFilledBar';
import { TimelineThumb } from './TimelineThumb';

const datasets = [ab_dates, mv_dates, ab_dates, ab_dates];

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

const isWithinSpan = (week: number, start: number, end: number, wrapped: boolean) => {
  return wrapped ? week >= start || week <= end : week >= start && week <= end;
};

const isNear = (a: number, b: number, range: number = 2, max: number = MAX_WEEK) => {
  const diff = Math.abs(a - b);
  return diff <= range;
};


export default function Timeline({
  onChangeWeek,
  nFlowWeeks,
}: {
  onChangeWeek: (week: number) => void;
  nFlowWeeks: number;
}) {
  const dispatch = useDispatch();

  const week = useSelector((state: RootState) => state.timeline.week);
  const isMonitor = useSelector((state: RootState) => state.ui.isMonitor);
  const flowResults = useSelector((state: RootState) => state.map.flowResults);
  const dataIndex = useSelector((state: RootState) => state.species.dataIndex);

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
  const [mode, setMode] = useState('');

  const todayPct = useMemo(() => getTimelinePosition(new Date()), []);

  const [hasInitialized, setHasInitialized] = useState(false);
  const updateMarkerAndSpan = () => {
    const getWeekFromDate = (date: Date): number => {
      const jan1 = new Date(date.getFullYear(), 0, 1);
      const days = Math.floor((date.getTime() - jan1.getTime()) / (1000 * 60 * 60 * 24));
      return Math.floor(days / 7);
    };

    if (mode === 'abundance' || mode === 'movement') {
      setSpanStart(0);
      setSpanEnd(MAX_WEEK);
      setLeftPct(0);
      setRightPct(100);
      return;
    }

    let newSpanStart = spanStart;
    let newSpanEnd = (spanStart + localNFlowWeeks) % WEEKS_PER_YEAR;
    let newMarkerWeek = mode === 'inflow' ? spanEnd : spanStart;

    if (mode === 'inflow' && !hasInitialized) {
      newSpanEnd = getWeekFromDate(new Date()) % WEEKS_PER_YEAR;
      newSpanStart = (newSpanEnd - localNFlowWeeks + WEEKS_PER_YEAR) % WEEKS_PER_YEAR;
      newMarkerWeek = newSpanEnd;
      setHasInitialized(true);
    }

    const wrapped = newSpanEnd < newSpanStart;

    setSpanStart(newSpanStart);
    setSpanEnd(newSpanEnd);
    setIsWrapped(wrapped);
    setLeftPct(getTimelinePosition(datasets[dataIndex][newSpanStart].date));
    setRightPct(getTimelinePosition(datasets[dataIndex][newSpanEnd].date));
    onChangeWeek(newMarkerWeek);
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
    if (flowResults.length > 0 || mode === 'abundance' || mode === 'movement') onChangeWeek(curWeek);
  });

  useEffect(() => {
    const mode = dataInfo[dataIndex].datatype; // 'inflow', 'outflow', 'abundance', 'movement'
    setMode(mode);
    stopPlayback();
    setIsPlaying(false);
    setSpanStart(markerWeek);
    setMarkerPct(getTimelinePosition(datasets[dataIndex][markerWeek].date));
  }, [dataIndex]);

  useEffect(updateMarkerAndSpan, [spanStart, mode]);

  useEffect(() => {
    setMarkerPct(getTimelinePosition(datasets[dataIndex][markerWeek].date));
  }, [markerWeek]);

  useEffect(() => {
    setSliderMarks(isMonitor ? monthMarks : []);
  }, [isMonitor]);

  useEffect(() => {
    const spanEnd = (spanStart + localNFlowWeeks) % WEEKS_PER_YEAR;
    const current = mode === 'inflow' ? spanEnd : spanStart;
    if (flowResults.length === 0) onChangeWeek(current);
    else setMarkerWeek(current);
    // Stop playback if no flow results are available
    if (flowResults.length === 0 && (mode !== 'abundance' && mode !== 'movement')) stopPlayback();
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
        <PlayPauseButton 
          isPlaying={isPlaying}
          onToggle={() => setIsPlaying(p => !p)}
          disabled={flowResults.length === 0 && (mode !== 'abundance' && mode !== 'movement')}
        />

        {/* Timeline Slider Area */}
        <div className="flex-1" style={{marginLeft: "5%"}}>

          {/* Thumb label and marker */}
          <div ref={ref} style={{ height: 32, position: 'relative', zIndex: 1000 }}>
            <TimelineMarkerLabel left={markerPct} label={datasets[dataIndex][markerWeek].label} />
            <TimelineMarkerDot left={markerPct} />
            <TimelineTodayMarker left={todayPct} />
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
            <TimelineFilledBar isWrapped={isWrapped} leftPct={leftPct} rightPct={rightPct} />

            {/* Month marks and labels */}
            {sliderMarks.map((mark, idx) => (
              <TimelineMonthMark
                label={mark.label}
                value={mark.value}
                isFirst={idx === 0}
                isLast={idx === sliderMarks.length - 1}
              />
            ))}

            {/* Thumbs: static blue circle (left) and blue arrow (right) */}
            {(mode === 'abundance' || mode === 'movement') ? (
  <>
    {/* LEFT blue circle */}
    <div
      className="group"
      style={{
        position: 'absolute',
        left: `calc(${leftPct}% - 14px)`,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 4,
        width: 28,
        height: 28,
        pointerEvents: 'none',
      }}
    >
      <TimelineThumb 
        positionPct={leftPct}
        type="circle"
        label={datasets[dataIndex][spanStart].label}
        showLabel={showSpanLabels}
        isDraggable={false}
        isPlaying={isPlaying}
        color="#228be6"
      />
    </div>

    {/* RIGHT blue circle */}
    <div
      className="group"
      style={{
        position: 'absolute',
        left: `calc(${rightPct}% - 14px)`,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 4,
        width: 28,
        height: 28,
        pointerEvents: 'none',
      }}
    >
      <TimelineThumb 
        positionPct={rightPct}
        type="circle"
        label={datasets[dataIndex][spanEnd].label}
        showLabel={showSpanLabels}
        isDraggable={false}
        isPlaying={isPlaying}
        color="#228be6"
      />
    </div>
  </>
            ) : mode === 'inflow' ? (
              <>
                {/* LEFT (arrow, not draggable, blue) */}
                <div
                  className="group"
                  style={{
                    position: 'absolute',
                    left: `calc(${leftPct}% - 14px)`,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 4,
                    width: 28,
                    height: 28,
                    pointerEvents: 'none',
                  }}
                >
                  <TimelineThumb 
                    positionPct={leftPct}
                    type="inflow_arrow"
                    label={datasets[dataIndex][spanStart].label}
                    showLabel={showSpanLabels && !isNear(spanStart, markerWeek)}
                    isDraggable={false}
                    isPlaying={isPlaying}
                    color="#228be6"
                  />
                </div>

                {/* RIGHT (circle, draggable, white) */}
                <div
                  className="group"
                  style={{
                    position: 'absolute',
                    left: `calc(${rightPct}% - 14px)`,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 4,
                    width: 28,
                    height: 28,
                    pointerEvents: !isPlaying ? 'auto' : 'none',
                  }}
                >
                  <TimelineThumb 
                    positionPct={rightPct}
                    type="circle"
                    label={datasets[dataIndex][spanEnd].label}
                    showLabel={showSpanLabels && !isNear(spanEnd, markerWeek)}
                    isDraggable={true}
                    isPlaying={isPlaying}
                    color="white"
                    setupDragHandlers={setupDragHandlers}
                  />
                  <div className="absolute left-1/2 top-full translate-x-[-50%] mt-2 px-2 py-1 rounded bg-black text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-95 transition pointer-events-none">
                    Flow start date; drag to change
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* LEFT (circle, draggable, white) */}
                <div
                  className="group"
                  style={{
                    position: 'absolute',
                    left: `calc(${leftPct}% - 14px)`,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 4,
                    width: 28,
                    height: 28,
                    pointerEvents: !isPlaying ? 'auto' : 'none',
                  }}
                >
                  <TimelineThumb 
                    positionPct={leftPct}
                    type="circle"
                    label={datasets[dataIndex][spanStart].label}
                    showLabel={showSpanLabels && !isNear(spanStart, markerWeek)}
                    isDraggable={true}
                    isPlaying={isPlaying}
                    color="white"
                    setupDragHandlers={setupDragHandlers}
                  />
                  <div className="absolute left-1/2 top-full translate-x-[-50%] mt-2 px-2 py-1 rounded bg-black text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-95 transition pointer-events-none">
                    Flow start date; drag to change
                  </div>
                </div>

                {/* RIGHT (arrow, not draggable, blue) */}
                <div
                  className="group"
                  style={{
                    position: 'absolute',
                    left: `calc(${rightPct}% - 14px)`,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 4,
                    width: 28,
                    height: 28,
                    pointerEvents: 'none',
                  }}
                >
                  <TimelineThumb 
                    positionPct={rightPct}
                    type="arrow"
                    label={datasets[dataIndex][spanEnd].label}
                    showLabel={showSpanLabels && !isNear(spanEnd, markerWeek)}
                    isDraggable={false}
                    isPlaying={isPlaying}
                    color="#228be6"
                  />
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
