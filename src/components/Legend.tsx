/* eslint-disable no-template-curly-in-string */
import { useEffect, useState } from 'react';
import { Grid } from '@mantine/core';
import { getScalingFilename, dataInfo} from '../hooks/dataUrl';

// Interface for the Legend 
interface LegendProps {
  dataTypeIndex: number;
  speciesIndex: number;
}

/* Creates a custom legend component based on the species scale values. */
function Legend(props: LegendProps) {
  const { dataTypeIndex, speciesIndex } = props;
  const [data, setData] = useState<string>();
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
        setData(x);
        // grab top and bottom values
        setLowLabel(d[0].value);
        setHighLabel(d[d.length-1].value);
        setMidLabel(Math.floor((d[d.length-1].value-d[0].value)/2));
      })
      .catch((error) => {
        alert(error);
      });
  }, [dataTypeIndex, speciesIndex]);

  return (
    <div className="Legend">
      <Grid align='stretch'>
        <Grid.Col span={4}>
          <div
            className="Legend-innerGradient"
            style={{
              display: 'inline-block',
              width: '14px',
              height: '180px',
              margin: '10px',
              background: `linear-gradient( 0deg, ${data} )`,
            }}
          />
        </Grid.Col>
        <Grid.Col span={8} >
          {/* PAM - this is a little hacky, couldn't get lowLabel to align "bottom"
             so made it so the midLabel would push it to the right place. */ }
          <div style={{alignContent:"top"}}>{highLabel}</div>
          <div style={{height:'75%', alignContent:"center"}}>{midLabel}</div>
          <div>{lowLabel}</div>
        </Grid.Col>
      </Grid>
      <div style={{textAlign:"center"}}>{dataInfo[dataTypeIndex].units}</div>

    </div>
  );
}

export default Legend;
