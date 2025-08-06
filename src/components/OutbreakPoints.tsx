import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import outbreaks from '../assets/outbreaks.json';
import { monthDayToWeek, isMobile } from '../utils/utils'
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

// lat, long position in degrees
type GeoLocation = [number, number]

type outMarker = {
    geoLoc: GeoLocation;
    year: number;
    yearsAgo: number;
    week: number;
    label: string;
    opacity?: number;
}

const outbreakMarkers: outMarker[]=[];
const NUM_OUTBREAK_WEEKS = 3;
const thisYear = new Date().getFullYear();

const RECENT_COLOR = 'red'
const HISTORIC_COLOR = '#57B9FF'

/**
 * Creates a circle-shaped Leaflet divIcon with the given color and opacity.
 *
 * @param color - Any valid CSS color (e.g. 'black', '#ff0000', 'rgba(0,0,0,0.5)')
 * @param opacity - A value from 0 to 1 for icon transparency
 * @param size - Optional circle size in pixels (default: 14)
 * @returns A Leaflet DivIcon
 */
export function circleIcon(color: string, opacity: number, size: number = 14) {
    const style = `
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        opacity: ${opacity};
        border-radius: 50%;
    `;

    return L.divIcon({
        html: `<div style="${style}"></div>`,
        iconSize: [size, size],
        className: '' // remove default marker styling
    });
}


export function loadOutbreaks() {
    if (outbreakMarkers.length > 0) return;

    outbreaks.forEach(outbreak => {
        const [yearStr, monthStr, dayStr] = outbreak.Confirmed.split('-');
        const year = Number(yearStr);
        const month = Number(monthStr);
        const day = Number(dayStr);

        outbreakMarkers.push({
            year,
            yearsAgo: thisYear - year,
            week: monthDayToWeek(month, day),
            geoLoc: [outbreak.GeoLoc[0], outbreak.GeoLoc[1]],
            label: `${outbreak.Confirmed}: ${outbreak.Production} (${outbreak.NumInfected})`,
        });
    });
}


function selectedOutbreaks(week: number, type: 'recent' | 'historic') : outMarker[] {
    const cutoffWeek = week - NUM_OUTBREAK_WEEKS;
    return outbreakMarkers
        .filter(marker => {
            if (type === 'recent') return marker.yearsAgo === 0;
            if (type === 'historic') return marker.yearsAgo > 0;
            return false;
        })
        .map(marker => {
            let opacity = 0.4; // default for Historic

            if (marker.yearsAgo === 0) {
                // Marker is from current year and within NUM_OUTBREAK_WEEKS weeks before the selected week
                if (marker.week >= cutoffWeek && marker.week <= week) {
                    opacity = 1.0;
                // Marker is from current year but more than NUM_OUTBREAK_WEEKS weeks before the selected week
                } else if (marker.week < cutoffWeek) {
                    opacity = 0.7;
                // Marker is from current year but after the selected week
                } else {
                    opacity = 0.5;
                }
            }

            return {
                ...marker,
                opacity
            };
        });
}


export function RecentOutbreakMarkers(week: number) {
    const currentMarkers = selectedOutbreaks(week, 'recent');
    return (
        currentMarkers.map((marker, i) => (
            // @ts-ignore
            <Marker icon={circleIcon(RECENT_COLOR, marker.opacity)}
                position={marker.geoLoc}
                key={i}
            >
                <Popup> {marker.label} </Popup>
            </Marker>
        ))
    ); 
}


export function HistoricOutbreakMarkers(week: number) {
    const currentMarkers = selectedOutbreaks(week, 'historic');
    return (
        currentMarkers.map((marker, i) => (
            // @ts-ignore
            <Marker icon={circleIcon(HISTORIC_COLOR, marker.opacity)}
                position={marker.geoLoc}
                key={i}
            >
                <Popup> {marker.label} </Popup>
            </Marker>
        ))
    ); 
}


export function OutbreakLegend() {
  const showRecentOutbreaks = useSelector((state: RootState) => state.map.showRecentOutbreaks);
  const showHistoricOutbreaks = useSelector((state: RootState) => state.map.showHistoricOutbreaks);

  if (!showRecentOutbreaks && !showHistoricOutbreaks) {
    return null;
  }

  function LegendIcon({ color, opacity, size = 14 }: { color: string; opacity: number; size?: number }) {
    return (
        <div
        style={{
            width: size,
            height: size,
            backgroundColor: color,
            opacity,
            borderRadius: '50%',
            marginRight: 8,
        }}
        />
    );
    }

  return (
    <div
      className="OutbreakLegend"
      style={{
        background: 'rgba(255, 255, 255, 0.6)',
        borderRadius: 10,
        padding: '6px 10px',
        fontSize: 12,
        maxWidth: '220px',
        marginBottom: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      <div style={{ fontWeight: 'bold', textAlign: 'center' }}>Outbreaks</div>

      {showRecentOutbreaks && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <LegendIcon color={RECENT_COLOR} opacity={1.0} /> <span>Last 3 weeks</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <LegendIcon color={RECENT_COLOR} opacity={0.75} /> <span>&gt;3 weeks before</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <LegendIcon color={RECENT_COLOR} opacity={0.5} /> <span>After selected week</span>
          </div>
        </>
      )}

      {showHistoricOutbreaks && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <LegendIcon color={HISTORIC_COLOR} opacity={0.5} /> <span>Historic (past years)</span>
        </div>
      )}
    </div>
  );
}
