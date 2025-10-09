import { ActionIcon, Tooltip } from '@mantine/core';
import { IconPlayerPauseFilled, IconPlayerPlayFilled } from '@tabler/icons-react';

export const PlayPauseButton = ({ isPlaying, onToggle, disabled }: {
  isPlaying: boolean;
  onToggle: () => void;
  disabled: boolean;
}) => (
  <div className="flex-shrink-0 mr-2" style={{ width: 48 }}>
    <Tooltip label="No flow results to play" disabled={!disabled}>
      <Tooltip label={isPlaying ? 'Pause' : 'Play'} disabled={disabled}>
        <ActionIcon
          size="xl"
          onClick={onToggle}
          variant={disabled ? 'default' : 'filled'}
          disabled={disabled}
          style={{ width: 48, height: 48 }}
        >
          {isPlaying ? <IconPlayerPauseFilled /> : <IconPlayerPlayFilled />}
        </ActionIcon>
      </Tooltip>
    </Tooltip>
  </div>
);
