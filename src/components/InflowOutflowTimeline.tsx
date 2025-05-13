import { useEffect, useRef, useState } from 'react';
import { ActionIcon, Grid, RangeSlider, Slider } from '@mantine/core';
import { useMove } from '@mantine/hooks';
import { IconPlayerPlayFilled, IconPlayerPauseFilled } from '@tabler/icons-react';
import ab_dates from '../assets/abundance_dates.json';
import mv_dates from '../assets/movement_dates.json';
import {dateToWeek, MIN_WEEK, MAX_WEEK, WEEKS_PER_YEAR} from '../utils/utils'
import { duration } from 'moment';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

// The Timeline includes three values the user can set.
// 1. the currently displayed week of a year.  This is done with a separate 'thumb' above the range slider.
// 2 & 3 are on the RangeSlider indicating the start and end weeks for playback are inflow/outflow.

const monthLabels: Array<string> = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
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
  const week = useSelector((state: RootState) => state.timeline.week);
  const { onChangeWeek, duration } = props;

  const isMonitor = useSelector((state: RootState) => state.ui.isMonitor);
  const dataIndex = useSelector((state: RootState) => state.species.dataIndex);

  // sizingProps are for things that change depending on if it is a smartPhone or monitor
  const [sizingProps, setSizingProps] = useState<sliderProps>();
  // need the adjustWeek code to handle the keypresses because it doesn't really handle variables well
  const [adjustWeek, setAdjustWeek] = useState(0);
  // weekRange are the values on the RangeSlider. weekRange[0] is always the first one,
  // and weekRange[1] is always the second one.  So to reverse the order, use isYearWrap.
  const [weekRange, setWeekRange] = useState<[number,number]>([MIN_WEEK, MAX_WEEK]);
  const [isYearWrap, setIsYearWrap] = useState<boolean>(false);
  // text indicating month on the timeline
  const [marks, setMarks] = useState<Array<Array<markProps>>>(Array.from({ length: 4 }, () => []));
  // the date label that shows up on the 'thumbs'
  const [dateLabels, setDateLabels] = useState<Array<Array<string>>>(Array.from({ length: 4 }, () => []));

  // sliderValue and ref are for the extra 'thumb' indicating the displayed week
  const [sliderValue, setSliderValue] = useState(week/WEEKS_PER_YEAR);
  const { ref } = useMove(({ x }) => { 
    onChangeWeek(Math.floor(x*WEEKS_PER_YEAR))
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playNext, setPlayNext] = useState<boolean>(false);
  const [playbackId, setPlaybackId] = useState<ReturnType<typeof setInterval>>();


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
    if (adjustWeek === 0) {
      return;
    }
    if (adjustWeek > 0) {
      // increments active index (wraps around when at end of year)
      let temp = week + 1;
      if (temp > MAX_WEEK) temp = MIN_WEEK;
      onChangeWeek(temp);
    } else {
      // decrements active index (wraps around when at beginning of year)
      let temp = week - 1;
      if (temp < MIN_WEEK) temp = MAX_WEEK;
      onChangeWeek(temp);
    }
    setAdjustWeek(0);
  }, [adjustWeek]);


  useEffect(() => {
    // At init or when window size changes, 
    // set props for both sliders
    var sProps: sliderProps ;
    if (isMonitor) {
      sProps = {size:'md', thumb:20, showLabel:true, marks:marks[dataIndex]}
    } else {
      sProps = {size:'sm', thumb:12, showLabel:false, marks:[]}
    }
    setSizingProps(sProps);
  }, [marks, isMonitor]);

  // update slider if week changes due to playback or keyboard
  useEffect(() => {
    // convert week index to a slider location value
    setSliderValue(week/MAX_WEEK);
  }, [week])

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
  
  async function playbackClick() {
    if (isPlaying) {
      // stop playback
      clearInterval(playbackId);
    } else {
      console.log("Play");
      // initialize week to beginning of playback range
      if (isYearWrap) {
        await onChangeWeek(weekRange[1]);
      } else {
        console.log("start at ", weekRange[0]);
        await onChangeWeek(weekRange[0]);
      }
      // trigger playback every 0.4 sec
      // remember whatever function is called will use the variables w/ their values now, 
      // and not notice any updates
      var id = setInterval(() => {setPlayNext(true)}, 400);
      setPlaybackId(id);
      // start it now - this will either pickup where it left off, or start at beginning as needed.
      setPlayNext(true)
    }
    // toggle isPlaying
    setIsPlaying(prevPlay => !prevPlay);
  };

  useEffect(() => {
    // PLAYBACK - update the display for the next week
    if (playNext) {
      console.log("playback before week?", week);
      var next_week:number = week+1;
      // check if at end of the range 
      if ((!isYearWrap) && (next_week > weekRange[1])) {
        console.log("not inverted, end of range")
        next_week = weekRange[0];
      } else if (isYearWrap) { 
        // if it is a yearWrap it's a little more complicated. 
        // check if it is before the beginning and reaches the end
        // 52 = weeks per year
        next_week = next_week%52;
        if ((next_week < weekRange[1]) && (next_week > weekRange[0])) {
          console.log("inverted end of range")
          next_week = weekRange[1];
        }     
      }
      onChangeWeek(next_week);
      setPlayNext(false);
    }
  }, [playNext, weekRange, week])

  return (
    <div className="Timeline">
      <Grid align='stretch'>
        <Grid.Col span={1}>
          {/* show Play or Pause button*/}
          {/* PLAY OR PAUSE FUNCTIONALITY NOT YET IMPLEMENTED FOR INFLOW/OUTFLOW. NEEDS BACKEND INTEGRATION */}
          {/* {isPlaying?
            <ActionIcon size={'xl'} onClick={() => { playbackClick() }}>
              <IconPlayerPauseFilled/>
            </ActionIcon>
          :
            <ActionIcon size={'xl'} onClick={() => { playbackClick() }}>
              <IconPlayerPlayFilled/>
            </ActionIcon>
          } */}
        </Grid.Col>
        <Grid.Col span={11}>
          {/* slider with only the thumb marker */}
          <div
            ref={ref}
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
          <CustomFixedRangeSlider  min={MIN_WEEK} max={MAX_WEEK} offset={duration} realValue={weekRange[0]} setRealValue={(val:number) => {setWeekRange([val, val + duration])}} showInflow={dataIndex == 2} />
        </Grid.Col>
      </Grid>
    </div>
  );
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
function CustomFixedRangeSlider({ min, max, offset, realValue, setRealValue, showInflow }: { min: number; max: number; offset: number; realValue: number; setRealValue: (val: number) => void; showInflow: boolean }) {
  // Real thumb values (draggable): realValue, setRealValue (state lifted up to parent component)
  // const [realValue, setRealValue] = useState(min);
  const range = max - min + 1;

  // Compute fake thumb value with wrap-around
  const fakeValue = ((realValue - min + offset) % range) + min;

  // Ref and useMove for track handling
  const { ref } = useMove(({ x }) => {
    // x is normalized (0 to 1)
    const newValue = min + x * (max - min);
    
    console.log("Dragging value for inflow/outflow:", Math.round(newValue), Math.round(newValue) + offset);

    setRealValue(Math.round(newValue));
  });

  // Compute percentage positions for styling
  const realPercent = ((realValue - min) / (max - min)) * 100;
  const fakePercent = ((fakeValue - min) / (max - min)) * 100;

  // Build a custom gradient for the filled bar
  // For a wrap-around, fill from 0 to fakePercent and from realPercent to 100%
  // Otherwise, fill from realPercent to fakePercent.
  const isWrapped = realValue > fakeValue;
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
    <div style={{ position: 'relative', width: '100%', height: "12px", background: '#dee2e6', border: "1px solid black"}}>
      {/* Custom filled bar */}
      <div style={{ ...filledStyle, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      
      {allMarks.map(markValue => {
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
            cursor: 'pointer',
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
            cursor: 'pointer',
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
      <div ref={ref} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, cursor: 'pointer' }} />
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
