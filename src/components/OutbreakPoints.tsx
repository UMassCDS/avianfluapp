//import { useEffect, useState } from 'react';
import geoCounties from '../assets/counties.json';
import outbreaks from '../assets/outbreaks2.json';


// PAM create some sort of init that translates all of the State/County pairs into lat/log and saves.
// create another function that add a marker with a given outbreak info to the map w/ correct lat/long and label
export function OutbreakData() {
    const showstrings = geoCounties.map((info, index) => (
        <p >
          {index}: {info.geoid}
        </p>
    ))

    console.log(outbreaks[4].State);
    /*
    return (
        <div style={{background:"pink"}}>
            <div>Outbreak Info</div>
            <div>{showstrings}</div>
        </div>
    ); */
}

