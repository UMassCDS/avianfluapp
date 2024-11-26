/* eslint-disable no-template-curly-in-string */
import { useEffect, useState } from 'react';
import { Grid, Stack, Tooltip } from '@mantine/core';
import { getScalingFilename, dataInfo} from '../hooks/dataUrl';
import { isMobile } from '../utils/utils';
// Interface for the Legend 
interface LegendProps {
  dataTypeIndex: number;
  speciesIndex: number;
}

/* Creates a custom legend component based on the species scale values. */
function Legend(props: LegendProps) {
  const { dataTypeIndex, speciesIndex } = props;
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
    const u = getScalingFilename(dataTypeIndex, speciesIndex);
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
  }, [dataTypeIndex, speciesIndex]);

  function stackedUnits() {
    let units: string[] = dataInfo[dataTypeIndex].units.split('/');
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
            <div style={{textAlign:"center"}}>{dataInfo[dataTypeIndex].units}</div>
          </Tooltip>
      </div>
    }
  </div>
  );
}

export default Legend;
