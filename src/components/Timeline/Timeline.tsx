import React, { useMemo, useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useMove } from '@mantine/hooks';
import { RootState } from '../../store/store';
import { clearOverlayUrl, clearFlowResults } from '../../store/slices/mapSlice';
import {MIN_WEEK, MAX_WEEK, WEEKS_PER_YEAR, getTimelinePosition, monthMarks} from '../../utils/utils'
import { dataInfo } from '../../hooks/dataUrl';
import ab_dates from '../../assets/abundance_dates.json';
import mv_dates from '../../assets/movement_dates.json';

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


// keep a display date inside the flow window by moving it to the nearest end.
const snapIntoWindow = (week: number, start: number, end: number, inset = 1) => {
  const onThumb = week === start || week === end;
  const inside = isWithinSpan(week, start, end, end < start) && (inset === 0 || !onThumb);
  if (inside) return week;
  // The track is linear (not a loop), so "nearest" is distance along the track: wrapping
  // around the year boundary would pick an end on the far side of the timeline.
  const dist = (a: number, b: number) => Math.abs(a - b);
  return dist(week, start) <= dist(week, end)
    ? (start + inset) % WEEKS_PER_YEAR
    : (end - inset + WEEKS_PER_YEAR) % WEEKS_PER_YEAR;
};

// Index of the dataset entry whose date is closest to today (ignoring year).
const closestWeekToToday = (dates: { date: string }[]) => {
  const todayPct = getTimelinePosition(new Date());
  let best = 0;
  let bestDist = Infinity;
  dates.forEach((d, i) => {
    const dist = Math.abs(getTimelinePosition(d.date) - todayPct);
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  });
  return best;
};

export default function Timeline({
  onChangeWeek,
  onChangeStartWeek, 
  nFlowWeeks,
  isPlaying,
  setIsPlaying,
  locationKey,
  isCalculating,
  startDateDragged,
  onThumbDragStart,
}: {
  onChangeWeek: (week: number) => void;
  onChangeStartWeek: (week: number) => void; 
  nFlowWeeks: number;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  locationKey: string; // selected location; '' if none
  isCalculating: boolean;
  startDateDragged: boolean; // user has dragged the start-date thumb (owned by Home)
  onThumbDragStart?: () => void; // user started dragging the start-date thumb
}) {
  const dispatch = useDispatch();

  const week = useSelector((state: RootState) => state.timeline.week);
  const isMonitor = useSelector((state: RootState) => state.ui.isMonitor);
  const flowResults = useSelector((state: RootState) => state.map.flowResults);
  const dataIndex = useSelector((state: RootState) => state.species.dataIndex);
  const lastFlowKeys = useSelector((state: RootState) => state.map.lastFlowKeys);

  const localNFlowWeeks = nFlowWeeks - 1;
  const playbackRef = useRef<NodeJS.Timeout | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

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

  // Start date anchor: outflow start / inflow end. Independent of the display date (markerWeek).
  const [anchorWeek, setAnchorWeekState] = useState(week);
  // Mirrors anchorWeek but updates synchronously, so effects in the same render as a change see it
  const anchorRef = useRef(week);
  const setAnchorWeek = (w: number) => {
    anchorRef.current = w;
    setAnchorWeekState(w);
  };
  // Last start date the user set in each flow view (undefined until they set one)
  const userAnchors = useRef<{ inflow?: number; outflow?: number }>({});
  const [hasMovedMarker, setHasMovedMarker] = useState(false);

  const isFlowMode = mode === 'inflow' || mode === 'outflow';
  // Hint to drag the start-date thumb: only before results, until the user drags it
  const showDragHint = isFlowMode && locationKey !== '' && !startDateDragged && !isCalculating && flowResults.length === 0 && !isPlaying;
  // Hint that the display date can now be moved: after results appear, until the user moves it
  const showMarkerHint = isFlowMode && flowResults.length > 0 && !hasMovedMarker && !isPlaying;

  const spanForAnchor = (anchor: number) => {
    const start = mode === 'inflow'
      ? (anchor - localNFlowWeeks + WEEKS_PER_YEAR) % WEEKS_PER_YEAR
      : anchor;
    return { start, end: (start + localNFlowWeeks) % WEEKS_PER_YEAR };
  };

  const startPlayback = () => {
    let current = markerWeek;

    playbackRef.current = setInterval(() => {
      current = (current + 1) % WEEKS_PER_YEAR;
      if (mode === 'abundance' || mode === 'movement') {
        if (!isWithinSpan(current, MIN_WEEK, MAX_WEEK, isWrapped)) current = spanStart;
      } else {
        if (!isWithinSpan(current, spanStart, spanEnd, isWrapped)) current = spanStart;
      }
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

    const end = (start + localNFlowWeeks) % WEEKS_PER_YEAR;
    const current = mode === "inflow" ? weekNum : start;

    setSpanStart(start);
    setSpanEnd(end);
    setAnchorWeek(weekNum);
    if (mode === 'inflow' || mode === 'outflow') userAnchors.current[mode] = weekNum;
    setMarkerWeek(current);
    onChangeWeek(current);
    onChangeStartWeek(weekNum);

    dispatch(clearFlowResults());
    dispatch(clearOverlayUrl());
  };

  const setupDragHandlers = (e: React.MouseEvent | React.TouchEvent) => {
    onThumbDragStart?.();
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

  // Always points at the latest render's snap logic, so the release handler never sees stale state.
  const dragWeekRef = useRef(markerWeek);
  const snapOnReleaseRef = useRef<() => void>(() => {});
  snapOnReleaseRef.current = () => {
    if (!isFlowMode || flowResults.length === 0) return;
    const { start, end } = spanForAnchor(anchorWeek);
    const snapped = snapIntoWindow(dragWeekRef.current, start, end, 0); // user-placed: may land on a thumb
    setMarkerWeek(snapped);
    onChangeWeek(snapped);
  };

  // Dragging is free anywhere on the timeline; on release in flow mode it snaps back into the window.
  const { ref } = useMove(
    ({ x }) => {
      const curWeek = Math.floor(x * (WEEKS_PER_YEAR - 1));
      dragWeekRef.current = curWeek;
      setHasMovedMarker(true);
      setMarkerWeek(curWeek);
      if (flowResults.length > 0 || mode === 'abundance' || mode === 'movement') onChangeWeek(curWeek);
    },
    {
      onScrubEnd: () => snapOnReleaseRef.current(),
    }
  );

  useEffect(() => {
    const mode = dataInfo[dataIndex].datatype; // 'inflow', 'outflow', 'abundance', 'movement'
    setMode(mode);
    stopPlayback();
    setIsPlaying(false);
    setMarkerPct(getTimelinePosition(datasets[dataIndex][markerWeek].date));
  }, [dataIndex]);

  // Derive the flow window from the persisted start date (anchor).
  useEffect(() => {
    if (!isFlowMode) return;
    const { start, end } = spanForAnchor(anchorWeek);
    setSpanStart(start);
    setSpanEnd(end);
    setIsWrapped(end < start);
    setLeftPct(getTimelinePosition(datasets[dataIndex][start].date));
    setRightPct(getTimelinePosition(datasets[dataIndex][end].date));
  }, [mode, anchorWeek, localNFlowWeeks, dataIndex]);

  // A calculation fixes that view's start date: from then on it is the view's last start date,
  // so the other-view / today fallbacks no longer apply to it.
  useEffect(() => {
    Object.values(lastFlowKeys).forEach((key) => {
      const type = dataInfo[key.dataIndex].datatype;
      if (type === 'inflow' || type === 'outflow') userAnchors.current[type] = key.week;
    });
  }, [lastFlowKeys]);

  // On mode switch into a flow view, pick the start date by preference:
  // 1) this view's last start date (set by dragging or by a calculation), 2) the other flow view's last user-set one,
  // 3) the entry closest to today. Then snap the display date into the new window.
  useEffect(() => {
    if (mode === '') return;
    if (!isFlowMode) {
      onChangeWeek(markerWeek);
      return;
    }
    const other = mode === 'inflow' ? 'outflow' : 'inflow';
    const anchor =
      userAnchors.current[mode] ??
      userAnchors.current[other] ??
      closestWeekToToday(datasets[dataIndex]);
    const { start, end } = spanForAnchor(anchor);
    const snapped = snapIntoWindow(markerWeek, start, end);
    setAnchorWeek(anchor);
    setMarkerWeek(snapped);
    onChangeWeek(snapped);
    onChangeStartWeek(anchor);
  }, [mode]);

  useEffect(() => {
    setMarkerPct(getTimelinePosition(datasets[dataIndex][markerWeek].date));
  }, [markerWeek]);

  useEffect(() => {
    setSliderMarks(isMonitor ? monthMarks : []);
  }, [isMonitor]);

  useEffect(() => {
    if (!isFlowMode) return;
    // flow results empty: display date starts at the start date
    if (flowResults.length === 0) {
      onChangeWeek(anchorRef.current);
      stopPlayback();
    } else {
      // results arrived: keep the display date if still valid, else re-snap it into the window
      const { start, end } = spanForAnchor(anchorRef.current);
      const snapped = snapIntoWindow(markerWeek, start, end);
      setMarkerWeek(snapped);
      onChangeWeek(snapped);
      setHasMovedMarker(false);
    }
  }, [flowResults]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") setHasMovedMarker(true);
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
      <div className={`flex items-center w-full ${!isMonitor ? 'scale-75' : ''}`}>
        {/* Timeline Slider Area */}
        <div className="flex-1">

          {/* Thumb label and marker */}
          <div ref={ref} style={{ height: 32, position: 'relative', zIndex: 1000 }}>
            {(flowResults.length > 0 || (mode !== 'inflow' && mode !== 'outflow')) && (
              <>
                <TimelineMarkerLabel left={markerPct} label={datasets[dataIndex][markerWeek].label} pulse={showMarkerHint} />
                <TimelineMarkerDot left={markerPct} />
              </>
            )}
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

            {(mode === 'abundance' || mode === 'movement') ? (
              <TimelineFilledBar isWrapped={false} leftPct={0} rightPct={100} />
            ) : (
              <TimelineFilledBar isWrapped={isWrapped} leftPct={leftPct} rightPct={rightPct} />
            )}

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
        left: `calc(${0}% - 14px)`,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 4,
        width: 28,
        height: 28,
        pointerEvents: 'none',
      }}
    >
      <TimelineThumb 
        positionPct={0}
        type="circle"
        label={datasets[dataIndex][MIN_WEEK].label}
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
        left: `calc(${100}% - 14px)`,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 4,
        width: 28,
        height: 28,
        pointerEvents: 'none',
      }}
    >
      <TimelineThumb 
        positionPct={100}
        type="circle"
        label={datasets[dataIndex][MAX_WEEK].label}
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
                    pulse={showDragHint}
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
                    pulse={showDragHint}
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
