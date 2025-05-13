/* eslint-disable no-template-curly-in-string */
import { useEffect, useState } from 'react';
import { Grid, Stack, Tooltip } from '@mantine/core';
import { getScalingFilename, dataInfo} from '../hooks/dataUrl';
import { isMobile } from '../utils/utils';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

/**
 * Creates a custom legend component that displays a color scale and value labels
 * based on the currently selected species and data index.
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
- Right now, the legend only shows up for abundance and movement data types.
- Legend for inflow and outflow data types are not implemented.
*/
function Legend() {
  const dataIndex = useSelector((state: RootState) => state.species.dataIndex);
  const speciesIndex = useSelector((state: RootState) => state.species.speciesIndex);

  const [colorScale, setColorScale] = useState<string>();
  const [lowLabel, setLowLabel] = useState<number>(0);
  const [midLabel, setMidLabel] = useState<number>(50);
  const [highLabel, setHighLabel] = useState<number>(100);

  // Fetches the JSON of values from the backend 
  const getJSON = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
      // check if response worked (no 404 errors etc...)
      throw new Error(response.statusText);
    }
    const d = response.json(); // get JSON from the response
    return d; // returns a promise, which resolves to this data value
  };

  // Every time the dataTypeIndex or speciesIndex is changed by the user, the legend updates
  useEffect(() => {
    const u = getScalingFilename(dataIndex, speciesIndex);
    getJSON(u)
      .then((d) => {
        const pushed: any[] = [];
        // transforms the JSON into a string and basically CSS code that can be inserted into the styles 
        d.map((i: any) => pushed.push(`${i.color} ${i.position}%`));
        const x = pushed.join(', ');
        setColorScale(x);
        // grab top and bottom values
        setLowLabel(d[0].value);
        setHighLabel(d[d.length-1].value);
        setMidLabel(Math.floor((d[d.length-1].value-d[0].value)/2));
      })
      .catch((error) => {
        alert(error);
      });
  }, [dataIndex, speciesIndex]);

  function stackedUnits() {
    let units: string[] = dataInfo[dataIndex].units.split('/');
    return units.join('/\n')
  }

  return (
    <div>
    {isMobile()?
      <div className="Legend" style={{background:"lightgrey", borderRadius:10}}>
        <div style={{textAlign:"center", fontSize:12}}>{highLabel}</div>
        <div
          style={{
            margin: 'auto',
            width: '10px',
            height: '120px',
            background: `linear-gradient( 0deg, ${colorScale} )`,
          }}
        />
        <div style={{textAlign:"center", fontSize:12}}>{lowLabel}</div>
        <Tooltip label='Average of 10 years of data.'>
          <div style={{textAlign:"center", fontSize:12}}>{stackedUnits()}</div>
        </Tooltip>
      </div>
    : 
      <div className="Legend" style={{background:"lightgrey", borderRadius:10}}>
        <Grid align='stretch'>
            <Grid.Col span={4}>
              <div
                style={{
                  display: 'inline-block',
                  width: '14px',
                  height: '180px',
                  margin: '10px',
                  background: `linear-gradient( 0deg, ${colorScale} )`,
                }}
              />
            </Grid.Col>
            <Grid.Col span={8} >
              <Stack h={200} align='flex-start'  justify='space-between' gap='xl'>
                <div>{highLabel}</div>
                <div>{midLabel}</div>
                <div>{lowLabel}</div>
              </Stack>
            </Grid.Col>
          </Grid>
          <Tooltip label='Average of 10 years of data.'>
            <div style={{textAlign:"center"}}>{dataInfo[dataIndex].units}</div>
          </Tooltip>
      </div>
    }
  </div>
  );
}

export default Legend;
