//import { useEffect, useState } from 'react';
import {Marker, Popup } from 'react-leaflet';
import geoCounties from '../assets/counties.json';
import outbreaks from '../assets/outbreaks.json';

// lat, long position in degrees
type GeoLocation = [number, number]
   
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
const today = new Date();
console.log(today.getFullYear() - 3);
const MSEC_TO_DAY = 24*60*60*1000;

function isShowOutbreak(text_date: string):boolean {
    // return true if we want to show this outbreak
    // for now the check is if it is from the last 3 years
    let parts = text_date.split('-')
    // part 0 is year
    console.log(parts[0]);
    if (Number(parts[0]) >= today.getFullYear() - 3) {
        let dateOfYear = new Date(today.getFullYear(),Number(parts[1])-1,Number(parts[2]));
        const diff_dates = today.valueOf()-dateOfYear.valueOf()
        const diff_day = Math.abs(Math.floor(diff_dates/MSEC_TO_DAY));

        return diff_day < 21;
    }
    return false;
}

// TODO may want to keep parts instead of Date
function convertToDate(text_date: string) {
    let parts = text_date.split('-')
    // part 0 is year, part 1 is month (Date obj starts w/ Jan as zero), part 2 is day
    return new Date(Number(parts[0]), Number(parts[1])-1, Number(parts[2]));
}

export function loadOutbreaks() {
    if (outbreakMarkers.length > 0) {
        // only run this once
        return;
    }
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
        locationDict[info.state][info.county.toUpperCase()] = [info.lat, info.lon]
    ))

    // convert outbreak data into markers by translating the State/County pairs into lat/log 
    for (var outbreak of outbreaks) {
        if (locationDict[outbreak.State][outbreak['County Name'].toUpperCase()] === undefined) {
            console.log(outbreak.State+", "+outbreak['County Name'].toUpperCase());
        }
        else if (isShowOutbreak(outbreak.Confirmed)) {
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
export function AddOutbreaks() {
    console.log(outbreakMarkers.length);
    return (
        outbreakMarkers.map((info, i) => (
            <Marker
                position={info.GeoLoc}
                key = {i}
            >
                <Popup>
                    {info.County+','+info.State+': '+info.NumInfected+','+info.Production}
                </Popup>
            </Marker>
        ))
    ); 
}
