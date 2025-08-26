/* eslint-disable no-template-curly-in-string */
import { useEffect, useState } from 'react';
import { Grid, Stack, Tooltip } from '@mantine/core';
import { getScalingFilename, dataInfo } from '../hooks/dataUrl';
import { isMobile } from '../utils/utils';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

/**
 * Creates a custom legend component that displays a color scale and value labels
 * based on the currently selected species and data index.
 *
 * Supports:
 * - Abundance/Movement (dataIndex < 2): loads JSON legend from server.
 * - Inflow/Outflow (dataIndex >= 2): reads preloaded legend URL from Redux state.
 * 
 * The legend updates dynamically whenever the user changes the data type or species,
 * fetching the appropriate color scale and value range from the backend.
 * 
 * - On mobile devices, the legend is rendered in a compact vertical layout.
 * - On desktop, the legend is rendered with a color bar and value labels aligned using a grid.
 * - Units and a tooltip with additional information are displayed below the legend.
 *
 * Uses Redux to access the current data and species indices.
 *
 * @component
 * @returns {JSX.Element} The rendered legend component.
 */

/*
- This is the Birds/km^2 (or Birds/km/week) Legend on the bottom left of the screen.
*/
function DataLegend() {
  const dataIndex = useSelector((state: RootState) => state.species.dataIndex);
  const speciesIndex = useSelector((state: RootState) => state.species.speciesIndex);
  const currentWeek = useSelector((state: RootState) => state.timeline.week);
  const flowResults = useSelector((state: RootState) => state.map.flowResults);

  const [colorScale, setColorScale] = useState<string>('');
  const [lowLabel, setLowLabel] = useState<number>(0);
  const [midLabel, setMidLabel] = useState<number>(50);
  const [highLabel, setHighLabel] = useState<number>(100);

  const getJSON = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(response.statusText);
    return await response.json();
  };

  const updateFromLegendJson = async (url: string) => {
    try {
      const d = await getJSON(url);
      const gradient = d.map((i: any) => `${i.color} ${i.position}%`).join(', ');
      setColorScale(gradient);
      setLowLabel(d[0].value);
      setHighLabel(d[d.length - 1].value);
      setMidLabel(Math.floor((d[d.length - 1].value - d[0].value) / 2));
    } catch (error) {
      console.error('Failed to load legend:', error);
    }
  };

  useEffect(() => {
    if (dataIndex < 2) {
      const url = getScalingFilename(dataIndex, speciesIndex);
      updateFromLegendJson(url);
    } else {
      const flowResult = flowResults.find((r) => r.week === currentWeek);
      if (flowResult?.legend) {
        updateFromLegendJson(flowResult.legend);
      } else {
        // Clear legend when not available
        setColorScale('');
        setLowLabel(0);
        setMidLabel(0);
        setHighLabel(0);
      }
    }
  }, [dataIndex, speciesIndex, flowResults, currentWeek]);

  const renderUnits = () => {
    const units = dataInfo[dataIndex].units;
    return isMobile() ? units.split('/').join('/\n') : units;
  };

  const ColorBar = (
    <div
      style={{
        width: isMobile() ? '10px' : '14px',
        height: isMobile() ? '120px' : '180px',
        margin: isMobile() ? '0 auto' : '10px',
        background: `linear-gradient(0deg, ${colorScale})`,
      }}
    />
  );

  return (
    <div
      className="DataLegend"
      style={{
        background: 'rgba(255, 255, 255, 0.6)',
        borderRadius: 10,
        padding: '6px',
        maxWidth: isMobile() ? '60px' : '120px',
      }}
    >
      <div style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: 6, fontSize: 12}}>
        {dataInfo[dataIndex].label}
      </div>
      {isMobile() ? (
        <>
          <div style={{ textAlign: 'center', fontSize: 12 }}>{highLabel}</div>
          {ColorBar}
          <div style={{ textAlign: 'center', fontSize: 12 }}>{lowLabel}</div>
          <Tooltip label="Average of 10 years of data.">
            <div style={{ textAlign: 'center', fontSize: 12 }}>{renderUnits()}</div>
          </Tooltip>
        </>
      ) : (
        <Grid align="stretch">
          <Grid.Col span={4}>{ColorBar}</Grid.Col>
          <Grid.Col span={8}>
            <Stack h={200} align="flex-start" justify="space-between" gap="xl">
              <div>{highLabel}</div>
              <div>{midLabel}</div>
              <div>{lowLabel}</div>
            </Stack>
          </Grid.Col>
          <Grid.Col span={12}>
            <Tooltip label="Average of 10 years of data.">
              <div style={{ textAlign: 'center' }}>{renderUnits()}</div>
            </Tooltip>
          </Grid.Col>
        </Grid>
      )}
    </div>
  );
}

export default DataLegend;