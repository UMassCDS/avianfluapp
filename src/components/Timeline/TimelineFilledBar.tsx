import React from 'react';

interface TimelineFilledBarProps {
  isWrapped: boolean;
  leftPct: number;
  rightPct: number;
}

export const TimelineFilledBar: React.FC<TimelineFilledBarProps> = ({ isWrapped, leftPct, rightPct }) => {
  const styleBase: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    background: '#228be6',
    zIndex: 1,
    borderRadius: 8,
  };

  if (isWrapped) {
    return (
      <>
        <div
          style={{
            ...styleBase,
            left: 0,
            width: `${rightPct}%`,
          }}
        />
        <div
          style={{
            ...styleBase,
            left: `${leftPct}%`,
            width: `${100 - leftPct}%`,
          }}
        />
      </>
    );
  }

  return (
    <div
      style={{
        ...styleBase,
        left: `${leftPct}%`,
        width: `${rightPct - leftPct}%`,
      }}
    />
  );
};
