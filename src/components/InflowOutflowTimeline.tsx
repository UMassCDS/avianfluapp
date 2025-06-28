import { useEffect, useRef, useState } from 'react';
import { ActionIcon, Grid, Tooltip } from '@mantine/core';
import { useMove } from '@mantine/hooks';
import { IconPlayerPlayFilled, IconPlayerPauseFilled } from '@tabler/icons-react';
import ab_dates from '../assets/abundance_dates.json';
import mv_dates from '../assets/movement_dates.json';
import {dateToWeek, MIN_WEEK, MAX_WEEK, WEEKS_PER_YEAR} from '../utils/utils'
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { clearFlowResults } from '../store/slices/mapSlice';

// The Timeline includes three values the user can set.
// 1. the currently displayed week of a year.  This is done with a separate 'thumb' above the range slider.
// 2 & 3 are on the RangeSlider indicating the start and end weeks for playback are inflow/outflow.

const monthLabels: Array<string> = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Month marks for typical 52-week year (adjust values if your months start on different weeks)
const monthMarks = [
  { value: 0, label: 'Jan' }, { value: 4, label: 'Feb' }, { value: 8, label: 'Mar' },
  { value: 13, label: 'Apr' }, { value: 17, label: 'May' }, { value: 21, label: 'Jun' },
  { value: 26, label: 'Jul' }, { value: 30, label: 'Aug' }, { value: 35, label: 'Sep' },
  { value: 39, label: 'Oct' }, { value: 43, label: 'Nov' }, { value: 47, label: 'Dec' }
];

// Keeps track of the props and prop type going into the component (look up interfaces in TypeScript)
interface TimelineProps {
  onChangeWeek: (week: number) => void;
  duration: number,
}

// text for the increments on the year slider
interface markProps {
  value: number;
  label: string;
}

interface sliderProps {
  size: string;     // size of the entire slider
  thumb: number;    // size of the thumb on slider
  showLabel: boolean;
  marks: Array<markProps>;
}
const minRange = -51;  // makes it so end can be before start - supports playback over end of year

/**
 * InflowOutflowTimeline is a React functional component that renders a timeline slider
 * for visualizing inflow and outflow data over a range of weeks. It provides interactive
 * controls for selecting weeks, playing through the timeline, and adjusting the displayed
 * week range. The component supports keyboard navigation using arrow keys.
 *
 * @component
 * @param {TimelineProps} props - The properties for the timeline, including:
 *   - onChangeWeek: Callback function to update the selected week.
 *   - duration: The duration (in weeks) for the range slider.
 *
 * @returns {JSX.Element} The rendered timeline component, including play/pause controls,
 * a custom slider with week labels, and support for inflow/outflow visualization.
 *
 * @remarks
 * - Uses Redux selectors to access timeline, UI, and species state.
 * - Handles keyboard events for week navigation.
 * - Supports playback functionality to automatically advance weeks.
 * - Dynamically generates date labels and slider marks based on dataset.
 * - Designed to be responsive for different device types.
 */

/*
- This is a custom slider component that I copied over from Pam's timeline component and customized it to work with the demands of inflow/outflow
- Unlike Pam's builtin component, I have separated the Timeline component and the "customized slider part" (the component known as CustomFixedRangeSlider(), which makes it more scalable and perhaps easier to understand) */
function InflowOutflowTimeline(props: TimelineProps) {
  const dispatch = useDispatch();

  const week = useSelector((state: RootState) => state.timeline.week);
  const { onChangeWeek, duration } = props;

  const isMonitor = useSelector((state: RootState) => state.ui.isMonitor);
  const dataIndex = useSelector((state: RootState) => state.species.dataIndex);
  const flowResults = useSelector((state: RootState) => state.map.flowResults);

  // sizingProps are for things that change depending on if it is a smartPhone or monitor
  const [sizingProps, setSizingProps] = useState<sliderProps>();
  // need the adjustWeek code to handle the keypresses because it doesn't really handle variables well
  const [adjustWeek, setAdjustWeek] = useState(0);
  // weekRange are the values on the RangeSlider. weekRange[0] is always the first one,
  // and weekRange[1] is always the second one.  So to reverse the order, use isYearWrap.
  const [weekRange, setWeekRange] = useState<[number, number]>([MIN_WEEK, MAX_WEEK]);
  const [isYearWrap, setIsYearWrap] = useState<boolean>(false);
  // text indicating month on the timeline
  const [marks, setMarks] = useState<Array<Array<markProps>>>(Array.from({ length: 4 }, () => []));
  // the date label that shows up on the 'thumbs'
  const [dateLabels, setDateLabels] = useState<Array<Array<string>>>(Array.from({ length: 4 }, () => []));

  // sliderValue and ref are for the extra 'thumb' indicating the displayed week
  const [sliderValue, setSliderValue] = useState(week / WEEKS_PER_YEAR);
  const { ref } = useMove(({ x }) => { 
    onChangeWeek(Math.floor(x * WEEKS_PER_YEAR))
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playNext, setPlayNext] = useState<boolean>(false);
  const [playbackId, setPlaybackId] = useState<ReturnType<typeof setInterval>>();
  const [isInflow, setIsInflow] = useState<boolean>(dataIndex == 2);

  const updateWeekRange = () => {
    if (isInflow) {
      setWeekRange([week - duration + 1, week + 1]);
    } else {
      setWeekRange([week + 1, week + duration + 1]);
    }
  };

  const onDoubleClick = () => {
    updateWeekRange()
    dispatch(clearFlowResults());
    
  };
  useEffect(() => {
    setIsInflow(dataIndex == 2);
  }, [dataIndex]);

  // The dates are slightly different for each dataset, so this initializes both 
  // sets of dateLabels so they don't have to be determined later.
  // Likewise the month breaks don't always occur on the same week number so the 
  // 'marks' can change.
  // TODO this may be moved into a csv file and just loaded
  useEffect(() => {
    // initialize labels[dataset][week]
    // The order of the labels needs to match the order of datasets in dataUrl.tsx/dataInfo[]
    
    // let datasets = [ab_dates, mv_dates]

    // Needs more for inflow/outflow
    let datasets = [ab_dates, mv_dates, ab_dates, ab_dates];

    let local_dates: Array<Array<string>> = Array.from({ length: datasets.length }, () => []);
    for (var i = 0; i < datasets.length; i += 1) {
      console.log(i);
      datasets[i].map((info) => (
        local_dates[i].push(info.label)
      ))
    }
    setDateLabels(local_dates);
    console.log(dateLabels);

    // NOT NEEDED FOR INFLOW/OUTFLOW SLIDER
    // initialize which timesteps get a month marker
    // let local_marks:Array<Array<markProps>> =[[],[]]
    // for (var i =0; i < datasets.length; i += 1) {
    //   for (var month of monthLabels){
    //     const result = datasets[i].find(({ label }) => label.includes(month));
    //     if (result !== undefined) {
    //       const thisMark: markProps = {value: result.index, label: month};
    //       local_marks[i].push(thisMark);
    //     }
    //   }
    // }
    // setMarks(local_marks);

    // determine current week 
    console.log("Init timeline")
    onChangeWeek(dateToWeek(new Date()));
    // attach keystrokes to timeline
    document.addEventListener('keydown', handleSelection);
    return () => {
      document.removeEventListener('keydown', handleSelection);
    };
  }, []);

  /* Allows the user to use the front and back arrow keys to control the week number 
    and which image files are being displayed. It is set with the values at the time 
    of addListener and does not get updated state variables. */ 
    const handleSelection = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setAdjustWeek(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setAdjustWeek(-1);
    }
  }
  
  useEffect(() => {
    if (adjustWeek === 0) return;
    let temp = week + adjustWeek;
    if (temp > MAX_WEEK) temp = MIN_WEEK;
    if (temp < MIN_WEEK) temp = MAX_WEEK;
    onChangeWeek(temp);
    setAdjustWeek(0);
  }, [adjustWeek]);

  // Adjust sizing based on screen type
  useEffect(() => {
    const props: sliderProps = isMonitor
      ? { size: 'md', thumb: 20, showLabel: true, marks: marks[dataIndex] }
      : { size: 'sm', thumb: 12, showLabel: false, marks: [] };
    setSizingProps(props);
  }, [marks, isMonitor]);

  // update slider if week changes due to playback or keyboard
  useEffect(() => {
    // convert week index to a slider location value
    setSliderValue(week / MAX_WEEK);

    if (Array.isArray(flowResults) && flowResults.length === 0) {
      updateWeekRange()
    }

  }, [week, isInflow, duration, flowResults])

  // return thumb label for the given week and the current dataIndex
  function showLabel(labelIndex: number) {
    return dateLabels[dataIndex][labelIndex];
  };
  
  // handle wrapping the time range over the end of year
  function checkIfReversed(start:number,end:number) {
    if (end < start) {
      // toggle isYearWrap
      setIsYearWrap(isWrap => !isWrap);
      // reverse weeks in range
      setWeekRange([end, start]);
    }
  };

  useEffect(() => {
    return () => {
      if (playbackId) clearInterval(playbackId);
    };
  }, [playbackId, dataIndex]);

  const weekRef = useRef(week);
    useEffect(() => {
      weekRef.current = week;
    }, [week]);

  // This is your "tick" function
  const advanceWeek = () => {
    let next_week = weekRef.current + 1;

    if (!isYearWrap && next_week > weekRange[1]) {
      next_week = weekRange[0];
    } else if (isYearWrap) {
      next_week = next_week % 52;
      if (next_week < weekRange[1] && next_week > weekRange[0]) {
        next_week = weekRange[1];
      }
    }

    onChangeWeek(next_week);
  };

  async function playbackClick() {
    if (isPlaying) {
      clearInterval(playbackId);
      setPlaybackId(undefined);
    } else {
      await onChangeWeek(isYearWrap ? weekRange[1] : weekRange[0]);

      const id = setInterval(() => {
        advanceWeek(); // Call directly here instead of setting state
      }, 400);

      setPlaybackId(id);
    }

    setIsPlaying((prev) => !prev);
  }

  return (
    <div className="Timeline">
      <Grid align='stretch'>
      <Tooltip label="No flow results to play" disabled={flowResults.length > 0}>
        <ActionIcon
          size="xl"
          onClick={playbackClick}
          disabled={flowResults.length === 0}
          variant={flowResults.length === 0 ? 'default' : 'filled'}
        >
          {isPlaying ? <IconPlayerPauseFilled /> : <IconPlayerPlayFilled />}
        </ActionIcon>
      </Tooltip>
        <Grid.Col span={11}>
          {/* slider with only the thumb marker */}
          <div
            ref={ref}
            onDoubleClick={onDoubleClick}
            style={{
              height: 25,
              position: 'relative',
              zIndex: 1000,
            }}
          >
            {/* Thumb  - TODO use icon w/ pointy bit at the bottom*/}
            <div
              className='slider-button'
              style={{
                position: 'absolute',
                left: `calc(${sliderValue * 100}% - ${'8px'})`,
                top: 0,
              }} >
                {/* SLIDER BUTTON - NEED TO BE REWORKED */}
                <div style={{backgroundColor: "white", padding: "3px"}}>
                  {dateLabels[dataIndex][week]}
                </div>
                {/* <IconCaretDownFilled viewBox='0, 5, 24, 24' /> */}
                <div style={{backgroundColor: "black", width: "3px", height: "23px"}}></div>
            </div>
          </div>
          <p></p>
          <CustomFixedRangeSlider
            min={MIN_WEEK}
            max={MAX_WEEK}
            offset={duration}
            realValue={weekRange[0]}
            setRealValue={(val:number) => {setWeekRange([val, val + duration])}}
            showInflow={isInflow}
          />
        </Grid.Col>
      </Grid>
    </div>
  );
}

interface CustomFixedRangeSliderProps {
  min: number;
  max: number;
  offset: number;
  realValue: number;
  setRealValue: (val: number) => void;
  showInflow: boolean;
}

/**
 * A custom fixed-range slider component with wrap-around and dual-thumb visualization.
 *
 * This slider displays a draggable "real" thumb and a "fake" thumb for visualizing offset or wrap-around behavior.
 * It supports both inflow and outflow modes, changing the thumb and arrow styles accordingly.
 *
 * @param min - The minimum value of the slider range.
 * @param max - The maximum value of the slider range.
 * @param offset - The offset applied to the fake thumb for wrap-around visualization.
 * @param realValue - The current value of the real (draggable) thumb.
 * @param setRealValue - Callback to update the realValue when the slider is moved.
 * @param showInflow - If true, displays inflow styling (filled thumb and hollow arrow); otherwise, outflow styling (hollow thumb and filled arrow).
 *
 * @remarks
 * - The slider visually fills the track between the real and fake thumbs, handling wrap-around cases.
 * - The real thumb is draggable, while the fake thumb is for display only.
 * - Designed for use cases where a circular or offset range visualization is needed (e.g., inflow/outflow timelines).
 */
function CustomFixedRangeSlider({ min, max, offset, realValue, setRealValue, showInflow }: CustomFixedRangeSliderProps) {
  // Real thumb values (draggable): realValue, setRealValue (state lifted up to parent component)
  // const [realValue, setRealValue] = useState(min);
  const range = max - min + 1;

  // Normalize realValue into the [min, max] range safely
  const normalizedRealValue = realValue < min ? realValue + max : realValue
  // Compute fake thumb value with wrap-around
  const fakeValue = ((normalizedRealValue - min + offset) % range) + min;

    // Compute percentage positions for styling
  const realPercent = ((normalizedRealValue - min) / (max - min)) * 100;
  const fakePercent = ((fakeValue - min) / (max - min)) * 100;

  // Ref and useMove for track handling
  const { ref } = useMove(({ x }) => {
    // x is normalized (0 to 1)
    const newValue = min + x * (max - min);
    const rounded = Math.round(newValue)
    console.log("Dragging value for inflow/outflow:", rounded, rounded + offset);
    setRealValue(rounded);
  });

  // Build a custom gradient for the filled bar
  // For a wrap-around, fill from 0 to fakePercent and from realPercent to 100%
  // Otherwise, fill from realPercent to fakePercent.
  const isWrapped = normalizedRealValue > fakeValue;
  const filledStyle = isWrapped 
    ? { background: `linear-gradient(to right,
        #228be6 0%, #228be6 ${fakePercent}%,
          transparent ${fakePercent}%,
          transparent ${realPercent}%,
        #228be6 ${realPercent}%,
        #228be6 100%)` }
    : { background: `linear-gradient(to right,
          transparent 0%,
          transparent ${realPercent}%,
        #228be6 ${realPercent}%,
        #228be6 ${fakePercent}%,
          transparent ${fakePercent}%,
          transparent 100%)` };

  const allMarks = Array.from({ length: range }, (_, i) => min + i);

  return (
    // <div style={{ position: 'relative', width: '100%', height: "12px", background: '#dee2e6', border: "1px solid black"}}>
    <div style={{
      position: 'relative',
      maxWidth: '100%',
      width: '100%',
      minWidth: 0,
      height: '10px', // more vertical space for marks/labels
      background: '#dee2e6',
      border: "1px solid black",
      borderRadius: 8,
      boxSizing: 'border-box',
      margin: '0 auto'
    }}>
    {/* Custom filled bar */}
      <div style={{ ...filledStyle, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      
      {/* {allMarks.map(markValue => {
        const markPercent = ((markValue - min) / (max - min)) * 100;
        if (markValue === min || markValue === max) return null;
        return (
          <div
            key={markValue}
            style={{
              position: 'absolute',
              left: `${markPercent}%`,
              top: 3,
              width: 4,
              height: 4,
              borderRadius: '50%',
              backgroundColor: 'white',
            }}
          />
        );
      })} */}

      {monthMarks.map(mark => {
  const markPercent = ((mark.value - min) / (max - min)) * 100;
  return (
    <div
      key={mark.value}
      style={{
        position: 'absolute',
        left: `${markPercent}%`,
        top: 3,
        width: 4,
        height: 4,
        borderRadius: '50%',
        backgroundColor: 'white',
      }}
    >
      <span style={{
        position: 'absolute',
        top: 18,
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'black',
        fontWeight: 500,
        fontSize: 12,
        whiteSpace: 'nowrap'
      }}>{mark.label}</span>
    </div>
  );
})}


      {showInflow && <>
        {/* Real draggable thumb (filled circle) */}
        <div
          style={{
            position: 'absolute',
            top: -8,
            left: `calc(${realPercent}% - 12px)`,
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: '#228be6',
            pointerEvents: 'none', // Ensure the thumb does not capture mouse events
          }}
          // Attach pointer events via the track useMove
        />

        {/* Fake thumb for display only (hollow arrow) */}
        <div
          style={{
            position: 'absolute',
            left: `calc(${fakePercent}% - 12px)`,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none', // decorative only
            width: 28,
            height: 28,
          }}
        >
          <HollowArrowThumb />
        </div>
      </>
      }


      {!showInflow && <>
        {/* Real draggable thumb (hollow circle) */}
        <div
          style={{
            position: 'absolute',
            top: -8,
            left: `calc(${realPercent}% - 12px)`,
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: 'white',
            border: '2px solid #228be6',
            pointerEvents: 'none', // Ensure the thumb does not capture mouse events
          }}
          // Attach pointer events via the track useMove
        />

        {/* Fake thumb for display only (filled arrow) */}
        <div
          style={{
            position: 'absolute',
            top: '50%', // vertical center of the track
            // Center the arrow horizontally relative to its computed percentage position:
            left: `calc(${fakePercent}% - 12px)`, // Adjust by half arrow "width"
            transform: 'translateY(-50%)',
            width: 0,
            height: 0,
            borderTop: '12px solid transparent',
            borderBottom: '12px solid transparent',
            borderLeft: `24px solid #228be6`,
            pointerEvents: 'none', // Ensure the fake thumb does not capture mouse events
          }}
        />
      </>}

      {/* Transparent overlay to capture pointer events from useMove */}
      {/* <div ref={ref} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, cursor: 'pointer' }} /> */}
    </div>
  );
}

/**
 * Renders a hollow arrow-shaped SVG thumb component.
 *
 * This component displays a right-pointing arrow with a white fill and a blue (#228be6) stroke.

 *
 * @returns {JSX.Element} The SVG element representing the hollow arrow thumb.
 */
function HollowArrowThumb() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24">
      <path 
        d="M0 0 L0 24 L20 12 Z" 
        fill="white" 
        stroke="#228be6" 
        strokeWidth="2.5" 
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"  // Keeps stroke width consistent during scaling
      />
    </svg>
  );
}

export default InflowOutflowTimeline;
