//import { useEffect, useState } from 'react';
import geoCounties from '../assets/counties.json';
import outbreaks from '../assets/outbreaks2.json';

export function OutbreakData() {

    console.log(typeof(outbreaks))
    const showstrings = geoCounties.map((info, index) => (
        <p >
          {index}: {info.geoid}
        </p>
    ))

    return (
        <div style={{background:"pink"}}>
            <div>Outbreak Info</div>
            <div>{showstrings}</div>
        </div>
    );
}

