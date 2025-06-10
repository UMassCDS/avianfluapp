import React from 'react';
import { Button } from '@mantine/core';
import axios from 'axios';

const BirdflowRApiBaseUrl = "http://localhost:8000"; // BirdflowR REST API base URL

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
  const handleClick = async () => {
    const functionName = dataIndex === 2 ? 'inflow' : 'outflow';
    const taxa = speciesOptions[speciesIndex]?.value || 'total';
    const locParam = location.join(';'); // support multiple if needed
    const url = `${BirdflowRApiBaseUrl}/${functionName}?loc=${locParam}&week=${week}&taxa=${taxa}&n=${nFlowWeeks}`;

    try {
      const response = await axios.get(url);
      console.log('API Response:', response.data);
    } catch (error) {
      console.error('API Error:', error);
    }
  };

  return (
    <Button       
      onClick={handleClick} 
      variant="outline" 
      color="blue" 
      mt="md"
      disabled={disabled}
    >
      Calculate {dataIndex === 2 ? 'Inflow' : 'Outflow'}
    </Button>
  );
};

export default InflowOutflowCalculateButton;