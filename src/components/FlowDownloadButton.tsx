import React from 'react';
import { Button, Tooltip } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const FlowDownloadButton = () => {
  const flowGeoTiffUrl = useSelector((state: RootState) => state.map.flowGeoTiffUrl);
  const isDisabled = !flowGeoTiffUrl;

  const tooltipLabel = isDisabled
    ? 'Run calculation to download GeoTIFF'
    : 'Download GeoTIFF';

  return (
    <Tooltip label={tooltipLabel} position="bottom" withArrow>
      <div>
        <a
          href={flowGeoTiffUrl || '#'}
          download
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            if (isDisabled) e.preventDefault(); // Prevent click when disabled
          }}
        >
          <Button
            variant="outline"
            color="blue"
            mt="md"
            disabled={isDisabled}
            className={`flex items-center gap-2 p-[6px] rounded-xl border-2 transition 
              font-semibold shadow-md 
              ${isDisabled
                ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
                : 'bg-white border-blue-400 text-blue-500 hover:bg-blue-50 hover:border-blue-500 active:bg-blue-100'}
            `}
          >
            <IconDownload size={22} className={isDisabled ? 'text-gray-400' : 'text-blue-500'} />
          </Button>
        </a>
      </div>
    </Tooltip>
  );
};

export default FlowDownloadButton;