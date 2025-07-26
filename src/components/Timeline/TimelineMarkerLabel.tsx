import React from 'react';
import { Tooltip } from '@mantine/core';

type MarkerLabelProps = {
  left: number;
  label: string;
};

export const TimelineMarkerLabel = ({ left, label }: MarkerLabelProps) => (
  <Tooltip label="Display date. Drag to change." position="top" withArrow offset={8}>
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
  </Tooltip>
);
