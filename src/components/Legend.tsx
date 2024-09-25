/* eslint-disable no-template-curly-in-string */
import { useEffect, useState } from 'react';
import { changeLegend, DataTypes} from '../hooks/dataUrl';
import '../styles/Legend.css';

// Interface for the Legend 
interface LegendProps {
  dataType: DataTypes;
  speciesType: string;
}

/* Creates a custom legend component based on the species scale values. */
function Legend(props: LegendProps) {
  const { dataType, speciesType } = props;
  const [data, setData] = useState<string>();

  // Fetches the JSON of values from the backend 
  const getJSON = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
      // TODO PAM how should it handle errors?
      // check if response worked (no 404 errors etc...)
      throw new Error(response.statusText);
    }
    const d = response.json(); // get JSON from the response
    return d; // returns a promise, which resolves to this data value
  };

  // Every time the dataType or speciesType is changed by the user, the legend updates
  useEffect(() => {
    const u = changeLegend(dataType, speciesType);
    getJSON(u)
      .then((d) => {
        const pushed: any[] = [];
        // transforms the JSON into a string and basically CSS code that can be inserted into the styles 
        d.map((i: any) => pushed.push(`${i.color} ${i.position}%`));
        const x = pushed.join(', ');
        setData(x);
      });
  }, [dataType, speciesType]);

  return (
    <div className="Legend">
      <div className="Legend-titles">
        <div>High</div>
        <div
          className="Legend-innerGradient"
          style={{
            display: 'inline-block',
            width: '10px',
            height: '200px',
            background: `linear-gradient( 0deg, ${data} )`,
            }}
        />
        <div>Low</div>
      </div>
    </div>
  );
}

export default Legend;
