/* eslint-disable no-template-curly-in-string */
import { useEffect, useState } from 'react';
import { changeLegend } from '../hooks/legendUrl';
import '../styles/Legend.css';

interface LegendProps {
  dataType: string;
  speciesType: string;
}

function Legend(props: LegendProps) {
  const { dataType, speciesType } = props;

  const [data, setData] = useState<string>();

  const getJSON = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok)
      // check if response worked (no 404 errors etc...)
      throw new Error(response.statusText);

    const d = response.json(); // get JSON from the response
    return d; // returns a promise, which resolves to this data value
  };

  useEffect(() => {
    const u = changeLegend(dataType, speciesType);
    getJSON(u)
      .then((d) => {
        const pushed: any[] = [];

        d.map((i: any) => pushed.push(`${i.color} ${i.position}%`));
        const x = pushed.join(', ');
        setData(x);
      })
      .catch((error) => {
        console.error(error);
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
