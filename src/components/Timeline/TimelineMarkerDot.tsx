import React from 'react';

type MarkerDotProps = {
  left: number;
};

export const TimelineMarkerDot = ({ left }: MarkerDotProps) => (
  <div
    className="timeline-marker-dot"
    style={{
      position: 'absolute',
      left: `calc(${left}% - 3px)`,
      top: '30px',
    }}
  />
);
