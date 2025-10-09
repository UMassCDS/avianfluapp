import React from 'react';

interface TimelineThumbProps {
  positionPct: number;
  type: 'circle' | 'arrow' | 'inflow_arrow'; // add inflow_arrow
  label?: string;
  showLabel?: boolean;
  color?: string;
  isDraggable?: boolean;
  isPlaying?: boolean;
  setupDragHandlers?: (e: React.MouseEvent | React.TouchEvent) => void;
}

export const TimelineThumb: React.FC<TimelineThumbProps> = ({
  positionPct,
  type,
  label,
  showLabel = false,
  isDraggable = false,
  isPlaying = false,
  color = '#228be6',
  setupDragHandlers,
}) => {
  const isInteractive = isDraggable && !isPlaying;

  return (
    <div
      style={{
        position: 'absolute',
        left: `calc(${positionPct}% - 14px)`,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 28,
        height: 28,
        zIndex: 2,
        cursor: isInteractive ? 'pointer' : 'default',
        pointerEvents: isInteractive ? 'auto' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseDown={isInteractive ? setupDragHandlers : undefined}
      onTouchStart={
        isInteractive
          ? (e) => {
              e.preventDefault();
              setupDragHandlers?.(e);
            }
          : undefined
      }
    >
      {showLabel && label && (
        <div
          className="timeline-label"
          style={{
            position: 'absolute',
            top: -28,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {label}
        </div>
      )}
      {type === 'circle' ? (
        <svg width={28} height={28}>
          <circle cx={14} cy={14} r={10} fill={color} stroke='#228be6' strokeWidth={2} />
        </svg>
      ) : type === 'inflow_arrow' ? (
        <svg width={28} height={28} viewBox="0 0 24 24" style={{ transform: 'rotate(180deg)' }}>
          <polygon
            points="6,6 22,12 6,18"
            fill={color}
            stroke='#228be6'
            strokeWidth={2}
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width={28} height={28} viewBox="0 0 24 24">
          <polygon
            points="6,6 22,12 6,18"
            fill={color}
            stroke='#228be6'
            strokeWidth={2}
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
};
