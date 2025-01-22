import { useEffect, useState } from 'react';
import { ActionIcon, Grid, Slider, RangeSlider } from '@mantine/core';
import { useMove } from '@mantine/hooks';
import { IconPlayerPlayFilled, IconPlayerPauseFilled } from '@tabler/icons-react';
import ab_dates from '../assets/abundance_dates.json';
import mv_dates from '../assets/movement_dates.json';
import {MIN_WEEK, MAX_WEEK} from '../utils/utils'


const months: Array<string> = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Keeps track of the props and prop type going into the component (look up interfaces in TypeScript)
interface TimelineProps {
  week: number;
  dataset: number;
  isRegSize: boolean;
  onChangeWeek: (val: number) => void;
}

interface markProps {
  value: number;
  label: string;
}

interface sliderProps {
  size: string;
  thumb: number;
  showLabel: boolean;
  marks: Array<markProps>;
}
const minRange = -51;  // makes it so end can be before start - supports playback over end of year
//           inverted={true}  this helps the timeline show right, but only if we flip values in weekRange

/* Creates a custom timeline slider that updates what week number of the year the user is currently on. */
function Timeline(props: TimelineProps) {
  const { week, dataset, isRegSize, onChangeWeek } = props;
  const [weekRange, setWeekRange] = useState<[number,number]>([week, (week+5)%MAX_WEEK]);
  const [myLabels, setMyLabels] = useState<Array<Array<string>>>([[],[]]);
  const [marks, setMarks] = useState<Array<Array<markProps>>>([[],[]]);
  const [sizingProps, setSizingProps] = useState<sliderProps>();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playNext, setPlayNext] = useState<boolean>(false);
  const [playbackId, setPlaybackId] = useState<ReturnType<typeof setInterval>>();
  const [isYearWrap, setIsYearWrap] = useState<boolean>(false);
  const [value, setValue] = useState(week);
  const [label, setLabel] = useState("");
  const { ref } = useMove(({ x }) => setValue(x));

  function thumbLabel():string|any {
    var index = Math.floor(value*MAX_WEEK);
    return myLabels[dataset][index];
  };

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
    setMyLabels(local_dates);

    // initialize which timesteps get a month marker
    let local_marks:Array<Array<markProps>> =[[],[]]
    for (var i =0; i < datasets.length; i += 1) {
      for (var month of months){
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
    if (isRegSize) {
      sProps = {size:'md', thumb:20, showLabel:true, marks:marks[dataset]}
    } else {
      sProps = {size:'sm', thumb:12, showLabel:false, marks:[]}
    }
    setSizingProps(sProps);
  }, [marks, isRegSize]);


  useEffect(() => {
    // play next
    if (playNext) {
      console.log("Week "+week);
      var next_week:number = week+1;
      // check if at end of the range 
      if ((!isYearWrap) && (next_week > weekRange[1])) {
        next_week = weekRange[0];
      }
      else if (isYearWrap) { 
        // if it is a yearWrap it's a little more complicated. 
        // check if it is before the begining and reaches the end
        next_week = next_week%52;
        if ((next_week < weekRange[1]) && (next_week > weekRange[0])) {
          next_week = weekRange[1];
        }     
      }
      console.log(next_week);
      // goes back to Home to update the map
      onChangeWeek(next_week);
      setPlayNext(false);
    }
  }, [playNext, weekRange, week])

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

  // handle wrapping playback
  function checkIfReversed() {
    if (weekRange[1] < weekRange[0]) {
      console.log("time to reverse "+weekRange)
      // toggle isYearWrap
      setIsYearWrap(isWrap => !isWrap);
      // reverse weeks in range
      setWeekRange(weeks => [weeks[1], weeks[0]]);
    }
  };

  useEffect(() => {
    if (isYearWrap) {
      console.log("WRAPPED "+weekRange);
    } else {
      console.log("REG "+weekRange);
    }
  }, [isYearWrap, weekRange])

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
            {/* Thumb */}
            <div
              style={{
                position: 'absolute',
                left: `calc(${value * 100}% - ${'8px'})`,
                top: 0,
                width: '16',
                height: '16',
                backgroundColor: "white",
              }} >
                {thumbLabel()}
              </div>
          </div>
          <Slider
            defaultValue={week}
            value={week}
            label={myLabels[dataset][week]}
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
          <RangeSlider
            defaultValue={weekRange}
            value={weekRange}
            label={myLabels[dataset][week]}
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
            onChangeEnd={() => { checkIfReversed()}}
            styles={() => ({
              thumb: {
                backgroundColor: "green",
              },
            })}
          />
        </Grid.Col>
      </Grid>
    </div>
  );
}

export default Timeline;
