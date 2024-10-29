import { useState } from 'react';
import { Slider } from '@mantine/core';
import { isMobile } from '../utils/mobile';

// Displays tick marks and labels 
const marks = [
  { value: 1, label: 'Jan' },
  { value: 6, label: 'Feb' },
  { value: 10, label: 'Mar' },
  { value: 14, label: 'Apr' },
  { value: 18, label: 'May' },
  { value: 23, label: 'Jun' },
  { value: 27, label: 'Jul' },
  { value: 32, label: 'Aug' },
  { value: 36, label: 'Sep' },
  { value: 40, label: 'Oct' },
  { value: 45, label: 'Nov' },
  { value: 49, label: 'Dec' },
];

const dateLabels = ['Jan 1', 'Jan 8', 'Jan 15', 'Jan 22', 'Jan 29',
'Feb 5', 'Feb 12', 'Feb 19', 'Feb 26', 
'Mar 3', 'Mar 10', 'Mar 17', 'Mar 24', 'Mar 31',
'Apr 7', 'Apr 14', 'Apr 21', 'Apr 28', 
'May 5', 'May 12', 'May 19', 'May 26',
'Jun 2', 'Jun 9', 'Jun 16', 'Jun 23', 'Jun 30',
'Jul 7', 'Jul 14', 'Jul 21', 'Jul 28',
'Aug 4', 'Aug 11', 'Aug 18', 'Aug 25',
'Sep 1', 'Sep 8', 'Sep 15', 'Sep 22', 'Sep 29',
'Oct 6', 'Oct 13', 'Oct 20', 'Oct 27',
'Nov 3', 'Nov 10', 'Nov 17', 'Nov 24', 
'Dec 1', 'Dec 8', 'Dec 15', 'Dec 22', 'Dec 29',
];
 

// Keeps track of the props and prop type going into the component (look up interfaces in TypeScript)
interface TimelineProps {
  week: number;
  onChangeWeek: (val: number) => void;
}

/* Creates a custom timeline slider that updates what week number of the year the user is currently on. */
function Timeline(props: TimelineProps) {
  const { week, onChangeWeek } = props;
  const [weekLabel, setWeekLabel] = useState<string>('');

  function changeWeekLabel(val: number) {
    setWeekLabel(dateLabels[val]);
    onChangeWeek(val);
  }

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
        size='sm'
        step={1}
        thumbSize={12}
        onChange={(v) => changeWeekLabel(v)}
      />
      : 
      <Slider
        defaultValue={week}
        value={week}
        label={weekLabel}
        marks={marks}
        min={1}
        max={52}
        labelAlwaysOn
        step={1}
        thumbSize={20}
        onChange={(v) => changeWeekLabel(v)}
      />}
    </div>
  );
}

export default Timeline;
