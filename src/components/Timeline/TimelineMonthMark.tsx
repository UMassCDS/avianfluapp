import React from 'react';

type MonthMarkProps = {
  key: string;
  label: string;
  value: number;
  isFirst?: boolean;
  isLast?: boolean;
};

export const TimelineMonthMark = ({ key, label, value, isFirst, isLast }: MonthMarkProps) => {
  const labelStyle: React.CSSProperties = {
    position: 'absolute',
    top: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: 12,
    color: 'gray',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    textAlign: 'center',
  };

  if (isFirst) {
    labelStyle.left = 0;
    labelStyle.transform = 'none';
    labelStyle.textAlign = 'left';
  } else if (isLast) {
    labelStyle.left = '100%';
    labelStyle.transform = 'translateX(-100%)';
    labelStyle.textAlign = 'right';
  }

  return (
    <div
    key={key}
      style={{
        position: 'absolute',
        left: `calc(${value}% - 3px)`,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: 'white',
        border: '1.5px solid #228be6',
        zIndex: 2,
      }}
    >
      <span style={labelStyle}>{label}</span>
    </div>
  );
};
