import { useEffect, useState } from 'react';
import { Slider } from '@mantine/core';
import { isMobile } from '../utils/utils';
import ab_dates from '../assets/abundance_dates.json';
import mv_dates from '../assets/movement_dates.json';


const months: Array<string> = [
  'Jan','Feb','Mar','Apr', 'May' ,'Jun','Jul','Aug', 'Sep','Oct','Nov','Dec'
];

// Keeps track of the props and prop type going into the component (look up interfaces in TypeScript)
interface TimelineProps {
  week: number;
  dataset: number;
  onChangeWeek: (val: number) => void;
}

interface markProps {
  value: number;
  label: string;
}

/* Creates a custom timeline slider that updates what week number of the year the user is currently on. */
function Timeline(props: TimelineProps) {
  const { week, onChangeWeek } = props;
  const dataset = props.dataset;
  const [weekLabel, setWeekLabel] = useState<string>('');
  const [labelInit, setLabelInit] = useState<boolean>(false);
  const [myLabels, setMyLabels] = useState<Array<Array<string>>>([[],[]]);
  const [marks, setMarks] = useState<Array<Array<markProps>>>([[],[]]);

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
    // update the label WHEN the check for overlay is complete
    if (labelInit) {
      setWeekLabel(myLabels[dataset][week-1]);
    }
  }, [week, props.dataset]);

  return (
    <div className="Timeline">
      {isMobile()?
      <Slider
        defaultValue={week}
        value={week}
        label={weekLabel}
        min={1}
        max={52}
        labelAlwaysOn
        size='sm' // sm screen
        step={1}
        thumbSize={12}  // sm screen
        onChange={(v) => { onChangeWeek(v)}}
      />
      : 
      <Slider
        defaultValue={week}
        value={week}
        label={weekLabel}
        marks={marks[dataset]} // lg screen
        min={1}
        max={52}
        labelAlwaysOn
        step={1}
        thumbSize={20} // lg screen
        onChange={(v) => onChangeWeek(v)}
      />}
    </div>
  );
}

export default Timeline;
