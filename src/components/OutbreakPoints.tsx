import { useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { fetchOutbreaks, OutbreakType } from '../store/slices/outbreaksSlice';
import { AppDispatch } from '../store/store'
import poultryLast3Weeks from '../assets/poultry_last_3_weeks.svg';
import poultryOver3Weeks from '../assets/poultry_over_3_weeks.svg';
import poultryAfterSelected from '../assets/poultry_after_selected.svg';
import bovineLast3Weeks from '../assets/bovine_last_3_weeks.svg';
import bovineOver3Weeks from '../assets/bovine_over_3_weeks.svg';
import bovineAfterSelected from '../assets/bovine_after_selected.svg';
import wildBirdLast3Weeks from '../assets/wild_bird_last_3_weeks.svg';
import wildBirdOver3Weeks from '../assets/wild_bird_over_3_weeks.svg';
import wildBirdAfterSelected from '../assets/wild_bird_after_selected.svg';

type GeoLocation = [number, number];

type OutbreakAge = 'last_3_weeks' | 'over_3_weeks' | 'after_selected';

type outMarker = {
  geoLoc: GeoLocation;
  year: number;
  yearsAgo: number;
  week: number;
  label: string;
  age?: OutbreakAge;
};

const NUM_OUTBREAK_WEEKS = 3;
const OUTBREAK_ICON_SIZE = 9;

const OUTBREAK_ICONS: Record<OutbreakType, Record<OutbreakAge, string>> = {
  poultry: {
    last_3_weeks: poultryLast3Weeks,
    over_3_weeks: poultryOver3Weeks,
    after_selected: poultryAfterSelected,
  },
  bovine: {
    last_3_weeks: bovineLast3Weeks,
    over_3_weeks: bovineOver3Weeks,
    after_selected: bovineAfterSelected,
  },
  wild_birds: {
    last_3_weeks: wildBirdLast3Weeks,
    over_3_weeks: wildBirdOver3Weeks,
    after_selected: wildBirdAfterSelected,
  },
};

const MAX_OUTBREAK_ICON_SIZE = 18;
const PX_PER_ICON_PX = 160; // 1440px wide -> 9px icon, 1920px -> 12px, 2560px -> 16px

function iconSizeForWidth(width: number) {
  const size = Math.round(width / PX_PER_ICON_PX);
  return Math.min(MAX_OUTBREAK_ICON_SIZE, Math.max(OUTBREAK_ICON_SIZE, size));
}

/** Outbreak icon size in px, scaled with the window width. */
export function useOutbreakIconSize() {
  const [size, setSize] = useState(() => iconSizeForWidth(window.innerWidth));

  useEffect(() => {
    const onResize = () => setSize(iconSizeForWidth(window.innerWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return size;
}

export function outbreakIcon(type: OutbreakType, age: OutbreakAge, size = OUTBREAK_ICON_SIZE) {
  const style = `width: ${size}px; height: ${size}px; object-fit: contain; display: block;`;

  return L.divIcon({
    html: `<img src="${OUTBREAK_ICONS[type][age]}" style="${style}" alt="" />`,
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
      let age: OutbreakAge = 'over_3_weeks'; // default for Historic

      if (marker.yearsAgo === 0) {
        // Marker is from current year and within NUM_OUTBREAK_WEEKS weeks before the selected week
        if (marker.week >= cutoffWeek && marker.week <= week) {
          age = 'last_3_weeks';
        // Marker is from current year but more than NUM_OUTBREAK_WEEKS weeks before the selected week
        } else if (marker.week < cutoffWeek) {
          age = 'over_3_weeks';
        // Marker is from current year but after the selected week
        } else {
          age = 'after_selected';
        }
      }

      return {
        ...marker,
        age
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

  const iconSize = useOutbreakIconSize();

  const EMPTY_ARRAY: any[] = [];
  const markers = useSelector((state: RootState) =>
    state.outbreaks[outbreakType]?.data || EMPTY_ARRAY
  );

  if (!show || !markers.length) return null;

  const filteredMarkers = selectedOutbreaks(markers, week, markerType);

  return (
    <>
      {filteredMarkers.map((marker, i) => (
        // @ts-ignore
        <Marker icon={outbreakIcon(outbreakType, marker.age!, iconSize)}
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
  const iconSize = useOutbreakIconSize();

  // If none enabled, hide legend
  const hasAnyEnabled = OUTBREAK_TYPES.some(type => showRecentOutbreaks[type] || showHistoricOutbreaks[type]);
  if (!hasAnyEnabled) return null;

  const LABELS: Record<OutbreakType, string> = {
    poultry: "Poultry",
    bovine: "Bovine",
    wild_birds: "Wild birds"
  };

  function LegendIcon({ type, age, size = iconSize }: { type: OutbreakType; age: OutbreakAge; size?: number }) {
    return (
      <img
        src={OUTBREAK_ICONS[type][age]}
        alt=""
        style={{ width: size, height: size, objectFit: 'contain', marginRight: 8 }}
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
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>
              {LABELS[type]}
            </div>
            {showRecentOutbreaks[type] && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LegendIcon type={type} age="last_3_weeks" /> <span>Last 3 weeks</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LegendIcon type={type} age="over_3_weeks" /> <span>&gt;3 weeks before</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LegendIcon type={type} age="after_selected" /> <span>After selected week</span>
                </div>
              </>
            )}
            {showHistoricOutbreaks[type] && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <LegendIcon type={type} age="over_3_weeks" /> <span>Historic (past years)</span>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
