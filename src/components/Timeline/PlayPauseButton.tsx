import { Button, Tooltip } from '@mantine/core';
import { IconPlayerPauseFilled, IconPlayerPlayFilled } from '@tabler/icons-react';

export const PlayPauseButton = ({ isPlaying, onToggle, disabled }: {
  isPlaying: boolean;
  onToggle: () => void;
  disabled: boolean;
}) => (
  <Tooltip label="No flow results to play" disabled={!disabled} position="bottom" withArrow>
    <div>
      <Tooltip label={isPlaying ? 'Pause' : 'Play'} disabled={disabled} position="bottom" withArrow>
        <Button
          variant="outline"
          color="blue"
          mt="md"
          onClick={onToggle}
          disabled={disabled}
          className={`flex items-center gap-2 p-[6px] rounded-xl border-2 transition 
            font-semibold shadow-md 
            ${disabled
              ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
              : 'bg-white border-blue-400 text-blue-500 hover:bg-blue-50 hover:border-blue-500 active:bg-blue-100'}
          `}
        >
          {isPlaying
            ? <IconPlayerPauseFilled size={22} className={disabled ? 'text-gray-400' : 'text-blue-500'} />
            : <IconPlayerPlayFilled size={22} className={disabled ? 'text-gray-400' : 'text-blue-500'} />}
        </Button>
      </Tooltip>
    </div>
  </Tooltip>
);
