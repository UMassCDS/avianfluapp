import { useEffect, useState } from 'react';
import { ActionIcon, Grid, RangeSlider } from '@mantine/core';
import { useMove } from '@mantine/hooks';
import { IconPlayerPlayFilled, IconPlayerPauseFilled } from '@tabler/icons-react';
import ab_dates from '../assets/abundance_dates.json';
import mv_dates from '../assets/movement_dates.json';
import {MIN_WEEK, MAX_WEEK} from '../utils/utils'

// The Timeline includes three values the user can set.
// 1. the currently displayed week of a year.  This is done with a separate 'thumb' above the range slider.
// 2 & 3 are on the RangeSlider indicating the start and end weeks for playback are inflow/outflow.

const monthLabels: Array<string> = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Keeps track of the props and prop type going into the component (look up interfaces in TypeScript)
interface TimelineProps {
  week: number;
  dataset: number;
  isMonitor: boolean; // True for monitor, false for smartphone or tablet
  onChangeWeek: (val: number) => void;
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

/* Creates a custom timeline slider that updates what week number of the year the user is currently on. */
function Timeline(props: TimelineProps) {
  const { week, dataset, isMonitor, onChangeWeek } = props;
  // sizingProps are for things that change depending on if it is a smartPhone or monitor
  const [sizingProps, setSizingProps] = useState<sliderProps>();

  // weekRange are the values on the RangeSlider. weekRange[0] is always the first one,
  // and weekRange[1] is always the second one.  So to reverse the order, use isYearWrap.
  const [weekRange, setWeekRange] = useState<[number,number]>([MIN_WEEK, MAX_WEEK]);
  const [isYearWrap, setIsYearWrap] = useState<boolean>(false);
  // text indicating month on the timeline
  const [marks, setMarks] = useState<Array<Array<markProps>>>([[],[]]);
  // the date label that shows up on the 'thumbs'
  const [dateLabels, setDateLabels] = useState<Array<Array<string>>>([[],[]]);

  // value and ref are for the extra 'thumb' indicating the displayed week
  const [value, setValue] = useState(week);
  const { ref } = useMove(({ x }) => setValue(x));

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
    let datasets = [ab_dates, mv_dates]
    let local_dates: Array<Array<string>> = [[],[]];
    for (var i =0; i < datasets.length; i += 1) {
      datasets[i].map((info) => (
        local_dates[i].push(info.label)
      ))
    }
    setDateLabels(local_dates);

    // initialize which timesteps get a month marker
    let local_marks:Array<Array<markProps>> =[[],[]]
    for (var i =0; i < datasets.length; i += 1) {
      for (var month of monthLabels){
        const result = datasets[i].find(({ label }) => label.includes(month));
        if (result !== undefined) {
          const thisMark: markProps = {value: result.index, label: month};
          local_marks[i].push(thisMark);
        }
      }
    }
    setMarks(local_marks);
  }, []);

  useEffect(() => {
    // At init or when window size changes, 
    // set props for both sliders
    var sProps: sliderProps ;
    if (isMonitor) {
      sProps = {size:'md', thumb:20, showLabel:true, marks:marks[dataset]}
    } else {
      sProps = {size:'sm', thumb:12, showLabel:false, marks:[]}
    }
    setSizingProps(sProps);
  }, [marks, isMonitor]);

  // handle displayThumb change
  useEffect(() => {
    // slider value is 0 to 1. Convert that to a week index.
    onChangeWeek(Math.floor(value*MAX_WEEK));
  }, [value])

  // change displayThumb if week changes
  useEffect(() => {
    // convert week index to a slider location value
    setValue(week/MAX_WEEK);
  }, [week])

  // return thumb label for the given week and the current dataset
  function showLabel(labelIndex: number) {
    return dateLabels[dataset][labelIndex];
  };
  
  // handle wrapping playback
  function checkIfReversed(start:number,end:number) {
    if (end < start) {
      // toggle isYearWrap
      setIsYearWrap(isWrap => !isWrap);
      // reverse weeks in range
      setWeekRange([end, start]);
    }
  };
  
  function playbackClick() {
    if (isPlaying) {
      // stop playback
      clearInterval(playbackId);
    } else {
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
      var next_week:number = week+1;
      // check if at end of the range 
      if ((!isYearWrap) && (next_week > weekRange[1])) {
        next_week = weekRange[0];
      } else if (isYearWrap) { 
        // if it is a yearWrap it's a little more complicated. 
        // check if it is before the beginning and reaches the end
        // 52 = weeks per year
        next_week = next_week%52;
        if ((next_week < weekRange[1]) && (next_week > weekRange[0])) {
          next_week = weekRange[1];
        }     
      }
      // goes back to Home to update the map
      onChangeWeek(next_week);
      setPlayNext(false);
    }
  }, [playNext, weekRange, week])

  return (
    <div className="Timeline">
      <Grid align='stretch'>
        <Grid.Col span={1}>
          {/* show Play or Pause button*/}
          {isPlaying?
            <ActionIcon size={'xl'} onClick={() => { playbackClick() }}>
              <IconPlayerPauseFilled/>
            </ActionIcon>
          :
            <ActionIcon size={'xl'} onClick={() => { playbackClick() }}>
              <IconPlayerPlayFilled/>
            </ActionIcon>
          }
        </Grid.Col>
        <Grid.Col span={11}>
          {/* slider with only the thumb marker */}
          <div
            ref={ref}
            style={{
              height: 16,
              position: 'relative',
            }}
          >
            {/* Thumb  - TODO use icon w/ pointy bit at the bottom*/}
            <div
              style={{
                position: 'absolute',
                left: `calc(${value * 100}% - ${'8px'})`,
                top: 0,
                width: '16',
                height: '16',
                backgroundColor: "white",
              }} >
                {dateLabels[dataset][week]}
              </div>
          </div>
          <p></p>
          <RangeSlider
            defaultValue={weekRange}
            value={weekRange}
            label={showLabel}
            min={MIN_WEEK}
            max={MAX_WEEK}
            step={1}
            minRange={minRange}
            marks={sizingProps?.marks}
            inverted={isYearWrap}
            size={sizingProps?.size}
            thumbSize={sizingProps?.thumb}
            labelAlwaysOn={false}
            onChange={(v) => { setWeekRange(v)}}
            onChangeEnd={(v) => { checkIfReversed(v[0], v[1])}}
          />
        </Grid.Col>
      </Grid>
    </div>
  );
}

/* if you want to put regular slider back in
          <Slider
            defaultValue={week}
            value={week}
            label={showLabel}
            min={MIN_WEEK}
            max={MAX_WEEK}
            color="light gray"
            marks={sizingProps?.marks}
            size={sizingProps?.size}
            thumbSize={sizingProps?.thumb}
            labelAlwaysOn={sizingProps?.showLabel}
            onChange={(v) => { onChangeWeek(v)}}
            styles={() => ({
              track: {backgroundColor: "pink"},
              mark: {borderColor: "light gray"},
              markFilled: {
                borderColor: "purple",
              },
            })}
          />
*/
export default Timeline;
