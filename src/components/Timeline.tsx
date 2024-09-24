import { Slider } from '@mantine/core';

  // Displays tick marks and labels 
  const marks = [
    { value: 1, label: 'Jan' },
    { value: 2 },
    { value: 3 },
    { value: 4 },
    { value: 5 },
    { value: 6, label: 'Feb' },
    { value: 7 },
    { value: 8 },
    { value: 9 },
    { value: 10, label: 'Mar' },
    { value: 11 },
    { value: 12 },
    { value: 13 },
    { value: 14, label: 'Apr' },
    { value: 15 },
    { value: 16 },
    { value: 17 },
    { value: 18, label: 'May' },
    { value: 19 },
    { value: 20 },
    { value: 21 },
    { value: 22 },
    { value: 23, label: 'Jun' },
    { value: 24 },
    { value: 25 },
    { value: 26 },
    { value: 27, label: 'Jul' },
    { value: 28 },
    { value: 29 },
    { value: 30 },
    { value: 31 },
    { value: 32, label: 'Aug' },
    { value: 33 },
    { value: 34 },
    { value: 35 },
    { value: 36, label: 'Sep' },
    { value: 37 },
    { value: 38 },
    { value: 39 },
    { value: 40, label: 'Oct' },
    { value: 41 },
    { value: 42 },
    { value: 43 },
    { value: 44 },
    { value: 45, label: 'Nov' },
    { value: 46 },
    { value: 47 },
    { value: 48 },
    { value: 49, label: 'Dec' },
    { value: 50 },
    { value: 51 },
    { value: 52 },
  ];

// Keeps track of the props and prop type going into the component (look up interfaces in TypeScript)
interface TimelineProps {
  week: number;
  onChangeWeek: (val: number) => void;
}

/* Creates a custom timeline slider that updates what week number of the year the user is currently on. */
function Timeline(props: TimelineProps) {


  const { week, onChangeWeek } = props;

  return (
    <div className="Timeline">
      <Slider
        defaultValue={week}
        value={week}
        marks={marks}
        min={1}
        max={52}
        labelAlwaysOn
        step={1}
        thumbSize={20}
        onChange={(v) => onChangeWeek(v)}
      />
    </div>
  );
}

export default Timeline;
