import { ImageOverlay, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { OutbreakMarkers } from "./OutbreakPoints";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { clearFlowResults, clearOverlayUrl } from '../store/slices/mapSlice';
import { IconClick, IconSearch } from "@tabler/icons-react";
import { Tooltip } from '@mantine/core';

const imageBounds = [
  [9.622994, -170.291626],
  [79.98956, -49.783429],
];

interface MapViewProps {
  week: number;
  dataIndex: number;
  onLocationSelect: (latLonString: string | null) => void;
  useSearchMode: boolean; // <-- add this
}

// @ts-ignore
const searchControl = new GeoSearchControl({
  provider: new OpenStreetMapProvider(),
  style: 'button',
  showPopup: true,
  retainZoomLevel: true,
  notFoundMessage: 'Sorry, that address could not be found.',
});

function MapClickHandler({ onLocationSelect, setMarkerPosition }: any) {
  const map = useMap();

  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const latLon = `${lat.toFixed(5)},${lng.toFixed(5)}`;
      console.log('Clicked location:', latLon);
      onLocationSelect(latLon);
      setMarkerPosition({ lat, lng });
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onLocationSelect]);

  return null;
}

function SearchField({ onLocationSelect, setMarkerPosition }: any) {
  const map = useMap();
  const [hasSearchMarker, setHasSearchMarker] = useState(false);

  useEffect(() => {
    map.addControl(searchControl);

    const handleSearch = (result: any) => {
      const latLon = `${result.location.y.toFixed(5)},${result.location.x.toFixed(5)}`;
      console.log('Search selected location:', latLon);
      onLocationSelect(latLon);
      setMarkerPosition(null);
      setHasSearchMarker(true);
    };

    map.on('geosearch/showlocation', handleSearch);

    // Poll for changes in searchControl.markers
    const interval = setInterval(() => {
      const currentMarkers = searchControl.markers.getLayers().length;

      if (hasSearchMarker && currentMarkers === 0) {
        console.log("Search marker removed → clearing location");
        onLocationSelect(null);
        setHasSearchMarker(false);
      }
    }, 300);

    return () => {
      map.removeControl(searchControl);
      map.off('geosearch/showlocation', handleSearch);
      clearInterval(interval);
    };
  }, [map, onLocationSelect, hasSearchMarker]);

  return null;
}

/**
 * MapView component renders an interactive map with optional search functionality,
 * data overlays, and outbreak markers.
 *
 * @param week - The current week to display outbreak markers for.
 * @param dataIndex - Index indicating which dataset is currently selected; controls search field visibility.
 * @param onLocationSelect - Callback function that receives a selected or clicked lat/lon string.
 * @returns JSX.Element representing the map view with overlays and controls.
 *
 * Features:
 * - Displays a map centered at a default position.
 * - Shows an image overlay based on the Redux state `overlayUrl`.
 * - Conditionally renders a geolocation search field when `dataIndex >= 2` (e.g. inflow or outflow selected).
 * - Adds outbreak markers for the specified week.
 * - Handles map click events and invokes `onLocationSelect` with latitude and longitude.
 *
 * Subcomponents:
 * - MapClickHandler: Uses `useMap()` to attach a click listener to the map and return lat/lon.
 * - SearchField: Uses `leaflet-geosearch` to allow address-based location search with marker and callback.
 *
 * Dependencies:
 * - Uses `react-redux`'s `useSelector` to access overlay URL from Redux state.
 * - Uses `react-leaflet` for map rendering and control hooks.
 * - Integrates `leaflet-geosearch` for geolocation search capability.
 */

/*
- SearchField component: A geolocation search bar powered by leaflet-geosearch (https://smeijer.github.io/leaflet-geosearch/)
- MapClickHandler component: Listens for user clicks on the map and extracts lat/lon for callbacks
- TileLayer component: Provides the base map (e.g. OSM tiles)
- ImageOverlay component: Displays a heatmap-style overlay image based on the selected week
- OutbreakMarkers function: Renders disease outbreak markers dynamically for the selected week
*/
export default function MapView({ week, dataIndex, onLocationSelect, useSearchMode }: MapViewProps): JSX.Element {
  const dispatch = useDispatch();

  const overlayUrl = useSelector((state: RootState) => state.map.overlayUrl);
  const showOutbreaks = useSelector((state: RootState) => state.map.showOutbreaks); // Get the toggle state
  const [markerPosition, setMarkerPosition] = useState<{ lat: number, lng: number } | null>(null);

  const position = { lat: 45, lng: -95 };

  const isInflowOutflowView = dataIndex >= 2;

  const toggleMode = () => {
    // Clear any existing marker on the map
    setMarkerPosition(null);

    // Clear markers and search results from the search control
    searchControl.markers.clearLayers();
    searchControl.clearResults();

    // Reset selected location
    onLocationSelect(null);

    // Clear previously fetched flow results and overlay image
    dispatch(clearFlowResults());
    dispatch(clearOverlayUrl());
  };

  // clear the marker and search result when isInflowOutflowView becomes false
  useEffect(() => {
  if (!isInflowOutflowView) {
    setMarkerPosition(null);
    searchControl.markers.clearLayers();
    searchControl.clearResults()
    onLocationSelect(null);
  }
}, [isInflowOutflowView]);

  return (
    <div style={{ position: "relative" }}>
    <MapContainer
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      center={position}
      zoom={3.5}
      style={{ height: '100vh', width: '100%' }}
      className="Map"
      keyboard={false}
      maxBounds={imageBounds}
    >
      {isInflowOutflowView && (
        <>
          <SearchField
            onLocationSelect={onLocationSelect}
            setMarkerPosition={setMarkerPosition}
          />
          <MapClickHandler
            onLocationSelect={onLocationSelect}
            setMarkerPosition={setMarkerPosition}
          />
        </>
      )}

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        attribution='Abundance data provided by <a target="_blank" href="https://ebird.org/science/status-and-trends ">Cornell Lab of Ornithology - eBird</a> | <a target="_blank" href="https://birdflow-science.github.io/"> BirdFlow </a>'
      />

      <ImageOverlay
        url={overlayUrl}
        bounds={imageBounds}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        opacity={0.7}
      />

      {markerPosition && (
        <Marker position={[markerPosition.lat, markerPosition.lng]}>
          <Popup>
            Selected Location:<br />
            {markerPosition.lat.toFixed(5)}, {markerPosition.lng.toFixed(5)}
          </Popup>
        </Marker>
      )}

      {/* This line now correctly hides/shows the markers */}
      {showOutbreaks && OutbreakMarkers(week)}
    </MapContainer>
    </div>
  );
}
