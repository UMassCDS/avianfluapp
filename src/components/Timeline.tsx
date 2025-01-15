import { useEffect, useState } from 'react';
import { Slider, RangeSlider } from '@mantine/core';
import { isMobile } from '../utils/utils';
import ab_dates from '../assets/abundance_dates.json';
import mv_dates from '../assets/movement_dates.json';
const MAX_WEEK = 52;  // number of weeks in a year

const months: Array<string> = [
  'Jan','Feb','Mar','Apr', 'May' ,'Jun','Jul','Aug', 'Sep','Oct','Nov','Dec'
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
const minRange = 5;  // TODO when we can handle inversion, make this -51
//           inverted={true}  this helps the timeline show right, but only if we flip values in weekRange

/* Creates a custom timeline slider that updates what week number of the year the user is currently on. */
function Timeline(props: TimelineProps) {
  const { week, dataset, isRegSize, onChangeWeek } = props;
  const [weekRange, setWeekRange] = useState<[number,number]>([week, (week+5)%MAX_WEEK]);
  const [labelInit, setLabelInit] = useState<boolean>(false);
  const [myLabels, setMyLabels] = useState<Array<Array<string>>>([[],[]]);
  const [marks, setMarks] = useState<Array<Array<markProps>>>([[],[]]);
  const [sizingProps, setSizingProps] = useState<sliderProps>();

  // Timeline - 
  useEffect(() => {
    // initialize labels[dataset][week]
    // TODO the order of the labels needs to match the order of datasets in dataUrl.tsx/dataInfo[]
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
    setLabelInit(true);
  }, []);

  useEffect(() => {
    // set props for both sliders after things initialized and if window size changes
    var sProps: sliderProps ;
    if (isRegSize) {
      sProps = {size:'md', thumb:20, showLabel:true, marks:marks[dataset]}
    } else {
      sProps = {size:'sm', thumb:12, showLabel:false, marks:[]}
    }
    setSizingProps(sProps);
  }, [marks, isRegSize]);


  function showLabel(labelIndex: number) {
    // update the label WHEN the check for overlay is complete
    if (labelInit) {
      return myLabels[dataset][labelIndex-1];
    }
    return "";
  };

  return (
    <div className="Timeline">
      <Slider
        defaultValue={week}
        value={week}
        label={myLabels[dataset][week-1]}
        min={1}
        max={52}
        marks={sizingProps?.marks}
        size={sizingProps?.size}
        thumbSize={sizingProps?.thumb}
        labelAlwaysOn={sizingProps?.showLabel}
        onChange={(v) => { onChangeWeek(v)}}
      />
      <RangeSlider
        defaultValue={weekRange}
        value={weekRange}
        label={showLabel}
        min={1}
        max={52}
        step={1}
        minRange={minRange}
        marks={sizingProps?.marks}
        size={sizingProps?.size}
        thumbSize={sizingProps?.thumb}
        labelAlwaysOn={false}
        onChange={(v) => { setWeekRange(v)}}
      />
    </div>
  );
}

export default Timeline;
