import { useEffect, useState } from 'react';
import { Slider } from '@mantine/core';
import { isMobile } from '../utils/utils';
import ab_dates from '../assets/abundance_dates.json';
import mv_dates from '../assets/movement_dates.json';


// Displays tick marks and labels 
const marks = [
  { value: 1, label: 'Jan' },
  { value: 5, label: 'Feb' },
  { value: 9, label: 'Mar' },
  { value: 13, label: 'Apr' },
  { value: 18, label: 'May' },
  { value: 22, label: 'Jun' },
  { value: 27, label: 'Jul' },
  { value: 32, label: 'Aug' },
  { value: 36, label: 'Sep' },
  { value: 40, label: 'Oct' },
  { value: 45, label: 'Nov' },
  { value: 49, label: 'Dec' },
];

// Keeps track of the props and prop type going into the component (look up interfaces in TypeScript)
interface TimelineProps {
  week: number;
  dataset: number;
  onChangeWeek: (val: number) => void;
}

/* Creates a custom timeline slider that updates what week number of the year the user is currently on. */
function Timeline(props: TimelineProps) {
  const { week, onChangeWeek } = props;
  const dataset = props.dataset;
  const [weekLabel, setWeekLabel] = useState<string>('');
  const [labelInit, setLabelInit] = useState<boolean>(false);
  const [myLabels, setMyLabels] = useState<Array<Array<string>>>([[],[]]);

  useEffect(() => {
    // initialize labels[dataset][week]
    // TODO the order of the labels needs to match the order of datasets in dataUrl.tsx/dataInfo[]
    let local_dates: Array<Array<string>> = [[],[]];
    ab_dates.map((info) => (
      local_dates[0].push(info.label)
    ))
    mv_dates.map((info) => (
      local_dates[1].push(info.label)
    ))
    setMyLabels(local_dates);
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
        marks={marks} // lg screen
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
