import { Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import outbreaks from '../assets/outbreaks.json';
import iconOne from '../assets/redLocationIcon.png';
import iconTwo from '../assets/orangeLocationIcon.png';
import iconThree from '../assets/iconPaleBlue.png';
import {monthDayToWeek, dateToWeek} from '../utils/utils'

// lat, long position in degrees
type GeoLocation = [number, number]

type outMarker = {
    geoLoc: GeoLocation;
    year: number;
    yearsAgo: number;
    week: number;
    label: string;
}

// This is the red location marker icon that is displayed on the map
function outbreakIcon(icon_path: string) {
    return new Icon({
        iconUrl: icon_path,
        iconSize: [22,35], // size of the icon
        iconAnchor: [18, 35], // the tip of the icon points to the middle bottom of the png
        popupAnchor: [8, -30] // point from which the popup should open relative to the iconAnchor
    })
}

const outbreakMarkers: outMarker[]=[];
const NUM_WEEKS = 2; // display outbreaks that occurred this_date +/- NUM_WEEKS
const thisYear = new Date().getFullYear();
const thisWeek = dateToWeek(new Date());
const markerIcons: (typeof Icon)[] = [
    outbreakIcon(iconOne),
    outbreakIcon(iconTwo),
    outbreakIcon(iconThree),
    outbreakIcon(iconThree),
]

/* This method goes through outbreaks.json, extract data from these entries and add it to the outbreakMarkers[] array to be processed by selectedOutbreaks() method */
export function loadOutbreaks() {
    if (outbreakMarkers.length > 0) {
        // only run this once
        return;
    }

    // convert outbreak data into markers by translating the State/County pairs into lat/log 
    for (var outbreak of outbreaks) {
        const outbreak_year = Number(outbreak.Confirmed.split('-')[0]);
        let marker:outMarker = {
            year: outbreak_year,
            yearsAgo: thisYear - outbreak_year,
            week: monthDayToWeek(Number(outbreak.Confirmed.split('-')[1]), Number(outbreak.Confirmed.split('-')[2])),
            geoLoc: [outbreak.GeoLoc[0],outbreak.GeoLoc[1]],
            label: outbreak.Confirmed+': '+outbreak.Production+' ('+outbreak.NumInfected+')',
        }
        if (marker.yearsAgo <= 1 ) {   
            outbreakMarkers.push(marker);
        }
    }
}


/* The way I understand this, this method returns the list of outbreaks to be rendered as OutbreakMarkers, in the current week. As for how the list is calculated/returned, I don't really know since Pam did it */
function selectedOutbreaks(this_week: number):outMarker[] {
    // show only outbreaks in the last year.  
    const markers: outMarker[]=[];

    for (var info of outbreakMarkers) {
        if ((info.yearsAgo === 0)  && (Math.abs(info.week-this_week) < NUM_WEEKS)) {
            // this year near the display date
            markers.push(info);
        }
        else if ((info.yearsAgo === 1)  && (info.week > thisWeek) && (Math.abs(info.week-this_week) < NUM_WEEKS)) {
            // last year, after today and near displayed day, 
            markers.push(info);
        } 
    }
    return markers;
}


/**
 * Renders outbreak markers for a given week (this is the location marker that changes when you move the slider bar).
 *
 * @param week - The week number to filter and display outbreak markers for.
 * @returns An array of Marker components representing outbreaks for the specified week.
 *
 * Each marker uses an icon based on how many years ago the outbreak occurred,
 * and displays a popup with a label describing the outbreak.
 */
export function OutbreakMarkers(week: number) {
    const currentMarkers = selectedOutbreaks(week);
    return (
        currentMarkers.map((info, i) => (
            // @ts-ignore
            <Marker icon={markerIcons[info.yearsAgo]}
                position={info.geoLoc}
                key={i}
            >
                <Popup>
                    {info.label}
                </Popup>
            </Marker>
        ))
    ); 
}


/**
 * Renders a legend for outbreak points, displaying icons and labels for the current year and the previous year.
 *
 * @component
 * @returns {JSX.Element} The outbreak legend component with icons and corresponding year labels.
 *
 * @example
 * <OutbreakLegend />
 *
 * @remarks
 * - Expects `iconOne`, `iconTwo`, and `thisYear` to be defined in the parent scope.
 * - Each legend entry consists of an icon and a bold label indicating the year.
 */
export const OutbreakLegend = () => (
    <div>
        <div style={{display:"flex"}}>
            <img src={iconOne} id="this_year" style={{ width: '20px', height: '30px' }} />    
            <label style={{fontWeight:"bold", margin:'5px'}}>{thisYear}</label>
        </div>
        <div style={{display:"flex"}}>
            <img src={iconTwo} id="last_year" style={{ width: '20px', height: '30px' }} />    
            <label style={{fontWeight:"bold", margin:'5px'}}>{thisYear-1}</label>
        </div>
    </div>
);
