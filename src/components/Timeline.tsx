import { useEffect, useState } from 'react';
import { ActionIcon, Grid, RangeSlider } from '@mantine/core';
import { useMove } from '@mantine/hooks';
import { IconCaretDownFilled, IconPlayerPlayFilled, IconPlayerPauseFilled } from '@tabler/icons-react';
import ab_dates from '../assets/abundance_dates.json';
import mv_dates from '../assets/movement_dates.json';
import { dateToWeek, getTimelinePosition, MIN_WEEK, MAX_WEEK, WEEKS_PER_YEAR } from '../utils/utils';

// The Timeline includes three values the user can set.
// 1. the currently displayed week of a year.  This is done with a separate 'thumb' above the range slider.
// 2 & 3 are on the RangeSlider indicating the start and end weeks for playback are inflow/outflow.

const monthLabels: Array<string> = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

interface TimelineProps {
  week: number;
  dataset: number;
  isMonitor: boolean; // True for monitor, false for smartphone or tablet
  onChangeWeek: (week: number) => Promise<void>;
}

interface markProps {
  value: number;
  label: string;
}

interface sliderProps {
  size: string;     // Size of the entire slider
  thumb: number;    // Size of the thumb on the slider
  showLabel: boolean;
  marks: Array<markProps>;
}

const minRange = -51; // Allows range selection to wrap over year-end

function Timeline(props: TimelineProps) {
  const { week, dataset, isMonitor, onChangeWeek } = props;

  const [sizingProps, setSizingProps] = useState<sliderProps>();
  const [adjustWeek, setAdjustWeek] = useState(0);
  const [weekRange, setWeekRange] = useState<[number, number]>([MIN_WEEK, MAX_WEEK]);
  const [isYearWrap, setIsYearWrap] = useState<boolean>(false);
  const [marks, setMarks] = useState<Array<Array<markProps>>>([[], []]);
  const [dateLabels, setDateLabels] = useState<Array<Array<string>>>([[], []]);
  // sliderValue and ref are for the extra 'thumb' indicating the displayed week
  const [sliderValue, setSliderValue] = useState(week / WEEKS_PER_YEAR);
  const { ref } = useMove(({ x }) => {
    console.log("useMove");
    onChangeWeek(Math.floor(x * WEEKS_PER_YEAR));
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
    const datasets = [ab_dates, mv_dates]
    const local_dates: Array<Array<string>> = [[], []];

    datasets.forEach((ds, i) => {
      ds.forEach((info) => local_dates[i].push(info.label));
    });
    setDateLabels(local_dates);

    // initialize which timesteps get a month marker
    const local_marks: Array<Array<markProps>> = [[], []];
    datasets.forEach((ds, i) => {
      monthLabels.forEach((month) => {
        const result = ds.find(({ label }) => label.includes(month));
        if (result !== undefined) {
          local_marks[i].push({ value: result.index, label: month });
        }
      });
    });
    setMarks(local_marks);

    // Initialize timeline to current date's week
    console.log("Init timeline");
    onChangeWeek(dateToWeek(new Date()));

    // Attach keyboard controls for timeline navigation
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
  };

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
      ? { size: 'md', thumb: 20, showLabel: true, marks: marks[dataset] }
      : { size: 'sm', thumb: 12, showLabel: false, marks: [] };
    setSizingProps(props);
  }, [marks, isMonitor]);

  // Update thumb position when week changes externally
  useEffect(() => {
    setSliderValue(week / MAX_WEEK);
  }, [week]);

  function showLabel(labelIndex: number) {
    return dateLabels[dataset][labelIndex];
  };

  // handle wrapping the time range over the end of year
  function checkIfReversed(start: number, end: number) {
    if (end < start) {
      setIsYearWrap((prev) => !prev);
      // reverse weeks in range
      setWeekRange([end, start]);
    }
  };

  async function playbackClick() {
    if (isPlaying) {
      clearInterval(playbackId);
    } else {
      // Start playback from the selected range
      await onChangeWeek(isYearWrap ? weekRange[1] : weekRange[0]);
      // trigger playback every 0.4 sec
      // remember whatever function is called will use the variables w/ their values now, 
      // and not notice any updates
      const id = setInterval(() => setPlayNext(true), 400);
      setPlaybackId(id);
      // start it now - this will either pickup where it left off, or start at beginning as needed.
      setPlayNext(true);
    }
    setIsPlaying((prev) => !prev);
  }

  // Advance to next week during playback
  useEffect(() => {
    if (!playNext) return;
    let next_week = (week + 1) % WEEKS_PER_YEAR;

    if (!isYearWrap && next_week > weekRange[1]) {
      next_week = weekRange[0];
    } else if (isYearWrap && next_week > weekRange[0] && next_week < weekRange[1]) {
      next_week = weekRange[1];
    }

    onChangeWeek(next_week);
    setPlayNext(false);
  }, [playNext, weekRange, week]);

  return (
    <div className="Timeline">
      <Grid align='stretch'>
        <Grid.Col span={1}>
          {/* show Play or Pause button*/}
          <ActionIcon size={'xl'} onClick={playbackClick}>
            {isPlaying ? <IconPlayerPauseFilled /> : <IconPlayerPlayFilled />}
          </ActionIcon>
        </Grid.Col>
        <Grid.Col span={11}>
          {/* Slider with additional thumb showing current week */}
          <div ref={ref} style={{ height: 32, position: 'relative', zIndex: 1000 }}>
            <div
              className="timeline-marker"
              style={{
                position: 'absolute',
                left: `calc(${sliderValue * 100}% - 40px)`,
                top: 0,
                cursor: 'pointer',
              }}
            >
              <div className="timeline-marker-label">
                {dateLabels[dataset][week]}
              </div>
            </div>
            <div
              className="timeline-marker-dot"
              style={{
                position: 'absolute',
                left: `calc(${sliderValue * 100}% - 3px)`,
                top: '33px',
              }}
            />
            <div
              className="timeline-today-marker"
              style={{
                left: `calc(${getTimelinePosition(new Date())}% - 2px)`,
                top: '36px',
                height: '8px',
              }}
            />
          </div>
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
            onChange={(v) => setWeekRange(v)}
            onChangeEnd={(v) => checkIfReversed(v[0], v[1])}
          />
        </Grid.Col>
      </Grid>
    </div>
  );
}

export default Timeline;
