import React from 'react';
import { IconArrowDownCircle, IconArrowUpCircle } from '@tabler/icons-react';
import { Button, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setFlowResults, updateOverlayByWeek } from '../store/slices/mapSlice';

const BirdflowRApiBaseUrl = "https://www.birdfluapi.com/mock"; // BirdflowR REST API base URL

type Props = {
  dataIndex: number; // 2 for inflow, 3 for outflow
  week: number;
  speciesIndex: number;
  location: string[]; // e.g. ['42.4,-73.45']
  nFlowWeeks: number;
  speciesOptions: { label: string; value: string }[]; // list with species codes
  disabled?: boolean;
};

const InflowOutflowCalculateButton: React.FC<Props> = ({
  dataIndex,
  week,
  speciesIndex,
  location,
  nFlowWeeks,
  speciesOptions,
  disabled,
}) => {
  const dispatch = useDispatch();

  // Get inflow/outflow label
  const flowType = dataIndex === 2 ? 'inflow' : 'outflow';

  // Tooltip logic
  let tooltipLabel = `Select start location to calculate ${flowType}`;
  if (location && location.length > 0) {
    // Parse lat/lon and round to 1 decimal
    const [lat, lon] = location[0].split(',').map(Number);
    const latStr = `${lat.toFixed(1)} N`;
    const lonStr = `${Math.abs(lon).toFixed(1)} W`;
    // Get start date label from speciesOptions or pass as prop if needed
    // Here, assume you have a week label array or can get it from props
    // For now, just show week number (replace with actual date label if available)
    tooltipLabel = `Calculate flow from ${latStr} ${lonStr}, week ${week}`;
  }

  const handleClick = async () => {
    if (!location || location.length === 0) {
      notifications.show({
        title: 'Select a Location',
        message: 'Please select a location on the map to begin inflow/outflow analysis.',
        color: 'blue',
      });
      return;
    }

    const functionName = dataIndex === 2 ? 'inflow' : 'outflow';
    const taxa = speciesOptions[speciesIndex]?.value || 'total';
    const locParam = location.join(';'); // support multiple if needed
    const url = `${BirdflowRApiBaseUrl}/${functionName}?loc=${locParam}&week=${week}&taxa=${taxa}&n=${nFlowWeeks}`;

    try {
      const response = await axios.get(url);
      const data = response.data;
      console.log('API Response:', data);

      if (data.status === 'success') {
        dispatch(setFlowResults(data));
        dispatch(updateOverlayByWeek(week));
      } else if (data.status === 'outside mask') {
        notifications.show({
          title: 'Outside prediction area',
          message: 'Selected location is outside the prediction mask. Try another point.',
          color: 'yellow',
        });
      } else if (data.status === 'error') {
        notifications.show({
          title: 'Error from backend',
          message: 'Something went wrong on the server. Please try again later.',
          color: 'red',
        });
      } else {
        notifications.show({
          title: 'Unexpected response',
          message: `Unknown status received: ${data.status}`,
          color: 'orange',
        });
      }
    } catch (error) {
      console.error('API Error:', error);
      notifications.show({
        title: 'Connection error',
        message: 'Unable to contact the server. Please check your internet connection.',
        color: 'red',
      });
    }
  };

  return (
    <Tooltip label={tooltipLabel} position="top" withArrow offset={8}>
      <Button       
        onClick={handleClick} 
        variant="outline" 
        color="blue" 
        mt="md"
        disabled={disabled}
        className={`flex items-center gap-2 p-[6px] rounded-xl border-2 transition 
          font-semibold shadow-md 
          ${disabled
            ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
            : 'bg-white border-blue-400 text-blue-500 hover:bg-blue-50 hover:border-blue-500 active:bg-blue-100'}
        `}
        type="button"
      >
        {dataIndex === 2 ? (
          <IconArrowDownCircle size={22} className={disabled ? "text-gray-400" : "text-blue-500"} />
        ) : (
          <IconArrowUpCircle size={22} className={disabled ? "text-gray-400" : "text-blue-500"} />
        )}
        Calculate {dataIndex === 2 ? 'Inflow' : 'Outflow'}
      </Button>
    </Tooltip>
  );
};

export default InflowOutflowCalculateButton;
