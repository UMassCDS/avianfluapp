import React from 'react';

type MarkerLabelProps = {
  left: number;
  label: string;
};

export const TimelineMarkerLabel = ({ left, label }: MarkerLabelProps) => (
  <div
    className="timeline-marker"
    style={{
      position: 'absolute',
      left: `calc(${left}% - 40px)`,
      top: 0,
      cursor: 'pointer',
    }}
  >
    <div className="timeline-marker-label">{label}</div>
  </div>
);
