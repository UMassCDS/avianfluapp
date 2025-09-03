import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { fetchOutbreaks, OutbreakType } from '../store/slices/outbreaksSlice';
import { AppDispatch } from '../store/store'

type GeoLocation = [number, number];

type outMarker = {
  geoLoc: GeoLocation;
  year: number;
  yearsAgo: number;
  week: number;
  label: string;
  opacity?: number;
};

const NUM_OUTBREAK_WEEKS = 3;

export const OUTBREAK_TYPE_COLORS: Record<OutbreakType, string> = {
  poultry: 'red',
  bovine: '#7e7e7eff',
  wild_birds: '#a0522d',
};

export function circleIcon(color: string, opacity: number, size = 9) {
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
    className: ''
  });
}

function selectedOutbreaks(markers: outMarker[], week: number, type: 'recent' | 'historic'): outMarker[] {
  const cutoffWeek = week - NUM_OUTBREAK_WEEKS;
  return markers
    .filter(marker => {
      if (type === 'recent') return marker.yearsAgo === 0;
      if (type === 'historic') return marker.yearsAgo > 0;
      return false;
    })
    .map(marker => {
      let opacity = 0.2; // default for Historic

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

export function OutbreakMarkersForType(props: { outbreakType: OutbreakType, week: number, markerType: 'recent' | 'historic' }) {
  const { outbreakType, week, markerType } = props;
  const show = useSelector((state: RootState) =>
    markerType === 'recent'
      ? state.map.showRecentOutbreaks[outbreakType]
      : state.map.showHistoricOutbreaks[outbreakType]
  );

  const EMPTY_ARRAY: any[] = [];
  const markers = useSelector((state: RootState) =>
    state.outbreaks[outbreakType]?.data || EMPTY_ARRAY
  );

  if (!show || !markers.length) return null;

  const color = OUTBREAK_TYPE_COLORS[outbreakType];
  const filteredMarkers = selectedOutbreaks(markers, week, markerType);

  return (
    <>
      {filteredMarkers.map((marker, i) => (
        // @ts-ignore
        <Marker icon={circleIcon(color, marker.opacity)}
          position={marker.geoLoc}
          key={i}
          pane={markerType === "recent" ? "recentPane" : "historicPane"}
        >
          <Popup> {marker.label} </Popup>
        </Marker>
      ))}
    </>
  );
}


const OUTBREAK_TYPES: OutbreakType[] = ['poultry', 'bovine', 'wild_birds'];

export function OutbreakMarkers() {
  const showRecentOutbreaks = useSelector((state: RootState) => state.map.showRecentOutbreaks);
  const showHistoricOutbreaks = useSelector((state: RootState) => state.map.showHistoricOutbreaks);
  const week = useSelector((state: RootState) => state.timeline.week);

  return (
    <>
      {OUTBREAK_TYPES.map((type) =>
        showRecentOutbreaks[type] ? (
          <OutbreakMarkersForType
            key={`${type}-recent`}
            outbreakType={type}
            week={week}
            markerType="recent"
          />
        ) : null
      )}
      {OUTBREAK_TYPES.map((type) =>
        showHistoricOutbreaks[type] ? (
          <OutbreakMarkersForType
            key={`${type}-historic`}
            outbreakType={type}
            week={week}
            markerType="historic"
          />
        ) : null
      )}
    </>
  );
}

/**
 * Dispatches fetchOutbreaks for all outbreak types.
 * Can be called in a useEffect or by event.
 */
export function loadOutbreaks(dispatch: AppDispatch) {
  OUTBREAK_TYPES.forEach(type => dispatch(fetchOutbreaks(type)));
}

export function OutbreakLegend() {
  const showRecentOutbreaks = useSelector((state: RootState) => state.map.showRecentOutbreaks);
  const showHistoricOutbreaks = useSelector((state: RootState) => state.map.showHistoricOutbreaks);

  // If none enabled, hide legend
  const hasAnyEnabled = OUTBREAK_TYPES.some(type => showRecentOutbreaks[type] || showHistoricOutbreaks[type]);
  if (!hasAnyEnabled) return null;

  const LABELS: Record<OutbreakType, string> = {
    poultry: "Poultry",
    bovine: "Bovine",
    wild_birds: "Wild birds"
  };

  function LegendIcon({ color, opacity, size = 9 }: { color: string; opacity: number; size?: number }) {
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
        maxWidth: '240px',
        marginBottom: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      <div style={{ fontWeight: 'bold', textAlign: 'center' }}>Outbreaks</div>

      {OUTBREAK_TYPES.map(type =>
        (showRecentOutbreaks[type] || showHistoricOutbreaks[type]) && (
          <div key={type}>
            <div style={{ fontSize: 12, fontWeight: 500, color: OUTBREAK_TYPE_COLORS[type], marginBottom: 2 }}>
              {LABELS[type]}
            </div>
            {showRecentOutbreaks[type] && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LegendIcon color={OUTBREAK_TYPE_COLORS[type]} opacity={1.0} /> <span>Last 3 weeks</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LegendIcon color={OUTBREAK_TYPE_COLORS[type]} opacity={0.75} /> <span>&gt;3 weeks before</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LegendIcon color={OUTBREAK_TYPE_COLORS[type]} opacity={0.5} /> <span>After selected week</span>
                </div>
              </>
            )}
            {showHistoricOutbreaks[type] && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <LegendIcon color={OUTBREAK_TYPE_COLORS[type]} opacity={0.1} /> <span>Historic (past years)</span>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
