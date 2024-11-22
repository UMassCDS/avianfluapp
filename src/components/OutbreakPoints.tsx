//import { useEffect, useState } from 'react';
import geoCounties from '../assets/counties.json';
import outbreaks from '../assets/outbreaks.json';


// translates all of the State/County pairs into lat/log and saves.
type GeoLocation = {
    lat: number;
    long: number;
};

type CountyDict = {
    [county: string]: GeoLocation;
};

type StateDict = {
    [state: string]: CountyDict;
};

type outMarker = {
    Confirmed: Date;
    State: string;
    County: string;
    Production: string;
    EndDate: any| Date;
    NumInfected: number;
    GeoLoc: GeoLocation;
}

const outbreakMarkers: outMarker[]=[];

// PAM check if month needs to subtract 1
function convertToDate(text_date: string) {
    let parts = text_date.split('-')
    return new Date(Number(parts[0]),Number(parts[1]),Number(parts[2]));
}

export function loadOutbreaks() {
    // create a dict with [state][county] = GeoLocation
    var locationDict: StateDict = {}
    const states = new Set<string>();

    // get all of the states
    geoCounties.map((info) => (
        states.add(info.state)
    ))
    for (let st of states) {
        locationDict[st] = {}
    }
    // add country and location info
    geoCounties.map((info) => (
        locationDict[info.state][info.county.toUpperCase()] = {lat:info.lat, long:info.lon}
    ))

    console.log("In loadOutbreaks");
    // convert outbreak data into markers 
    for (var outbreak of outbreaks) {
        if (locationDict[outbreak.State][outbreak['County Name'].toUpperCase()] === undefined) {
            console.log(outbreak.State+", "+outbreak['County Name'].toUpperCase());
        }
        else {
            let marker:outMarker = {
                Confirmed: convertToDate(outbreak.Confirmed),
                State: outbreak.State,
                County: outbreak["County Name"],
                Production: outbreak.Production,
                EndDate: convertToDate(outbreak.EndDate),
                NumInfected: Number(outbreak.NumInfected),
                GeoLoc: locationDict[outbreak.State][outbreak['County Name'].toUpperCase()]
            }
            outbreakMarkers.push(marker);
        }
    }
    console.log(outbreakMarkers.length)
}

// create another function that add a marker with a given outbreak info to the map w/ correct lat/long and label
export function OutbreakData() {
    var text = "Nothing"
    if (outbreakMarkers.length > 0) {
        text = outbreakMarkers[0].State
    }
    return (
        <div style={{background:"pink", justifyContent:"right", justifyItems:'right'}} >
            <div> Outbreak Info</div>
            <p>{text}</p>
        </div>
    ); 
}

