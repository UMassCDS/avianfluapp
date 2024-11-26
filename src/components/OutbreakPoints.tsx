//import { useEffect, useState } from 'react';
import {Marker, Popup } from 'react-leaflet';
import geoCounties from '../assets/counties.json';
import outbreaks from '../assets/outbreaks.json';
import {monthDayToWeek} from '../utils/utils'

// lat, long position in degrees
type GeoLocation = [number, number]

type outMarker = {
    GeoLoc: GeoLocation;
    year: number;
    week: number;
    label: string;
}

const outbreakMarkers: outMarker[]=[];
const NUM_YEARS = 3; // number of years back
const NUM_WEEKS = 2; // number of weeks +/-
const thisYear = new Date().getFullYear();

export function loadOutbreaks() {
    if (outbreakMarkers.length > 0) {
        // only run this once
        return;
    }

    // create a dict with [state][county] = GeoLocation    
    type LocationDict = {
        [state: string]: {
            [county: string]: GeoLocation;
        };
    };
    var locationDict: LocationDict = {}

    // get all of the states
    const states = new Set<string>();
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
        } else {
            let marker:outMarker = {
                year: Number(outbreak.Confirmed.split('-')[0]),
                week: monthDayToWeek(Number(outbreak.Confirmed.split('-')[1])-1, Number(outbreak.Confirmed.split('-')[2])),
                GeoLoc: locationDict[outbreak.State][outbreak['County Name'].toUpperCase()],
                label: outbreak["County Name"]+','+outbreak.State+' @'+outbreak.Confirmed,
                // label: outbreak["County Name"]+','+outbreak.State+': '+outbreak.NumInfected+','+outbreak.Production
            }
            outbreakMarkers.push(marker);
        }
    }
}


function selectedOutbreaks(this_week: number):outMarker[] {
    // determine which outbreaks occurred within the last NUM_YEARS
    // and within the same week +/- NUM_WEEKS
    const markers: outMarker[]=[];

    for (var info of outbreakMarkers) {
        if ((info.year >= thisYear - NUM_YEARS ) && (Math.abs(info.week-this_week) <= NUM_WEEKS)) {
            markers.push(info);
        }
    }
    return markers;
}

// Adds markers with a outbreak info to the map w/ at the correct lat/long
export function OutbreakMarkers(week: number) {
    const currentMarkers = selectedOutbreaks(week);
    return (
        currentMarkers.map((info, i) => (
            <Marker
                position={info.GeoLoc}
                key={i}
            >
                <Popup>
                    {info.label}
                </Popup>
            </Marker>
        ))
    ); 
}
