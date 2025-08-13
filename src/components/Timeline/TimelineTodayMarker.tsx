import React from 'react';

type TodayMarkerProps = {
  left: number;
};

export const TimelineTodayMarker = ({ left }: TodayMarkerProps) => (
  <div
    className="timeline-today-marker"
    style={{
      left: `calc(${left}% - 2px)`,
    }}
  />
);
