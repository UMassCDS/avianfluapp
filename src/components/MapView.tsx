import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";
import { MapContainer, TileLayer, Marker, Popup, ImageOverlay, useMap } from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { HistoricOutbreakMarkers, RecentOutbreakMarkers } from "./OutbreakPoints";


const imageBounds = [
  [9.622994, -170.291626],
  [79.98956, -49.783429],
];

function OutbreakPanes() {
  const map = useMap();

  useEffect(() => {
    // Historic outbreaks pane (lower z-index)
    if (!map.getPane("historicPane")) {
      map.createPane("historicPane");
      map.getPane("historicPane")!.style.zIndex = "400";
    }

    // Recent outbreaks pane (higher z-index)
    if (!map.getPane("recentPane")) {
      map.createPane("recentPane");
      map.getPane("recentPane")!.style.zIndex = "500";
    }
  }, [map]);

  return null;
}

function MapClickHandler({ setMarker }: { setMarker: (lat: number, lng: number, label: string) => void }) {
  const map = useMap();

  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setMarker(lat, lng, "Selected Location:");
    };

    map.on("click", handleClick);
    return () => map.off("click", handleClick);
  }, [map, setMarker]);

  return null;
}

function SearchHandler({ setMarker }: { setMarker: (lat: number, lng: number, label: string) => void }) {
  const map = useMap();

  useEffect(() => {
    // @ts-ignore
    const searchControl = new GeoSearchControl({
      provider: new OpenStreetMapProvider(),
      style: "button",
      showMarker: false,
      retainZoomLevel: true,
      notFoundMessage: "Sorry, that address could not be found.",
    });

    map.addControl(searchControl);

    const handleSearch = (result: any) => {
      const { x, y, label } = result.location;
      setMarker(y, x, label); // y = lat, x = lng
    };

    map.on("geosearch/showlocation", handleSearch);

    return () => {
      map.removeControl(searchControl);
      map.off("geosearch/showlocation", handleSearch);
    };
  }, [map, setMarker]);

  return null;
}

/**
 * MapView component renders an interactive map with optional search functionality,
 * data overlays, and outbreak markers.
 *
 * @param week - The current week to display outbreak markers for.
 * @param dataIndex - Index indicating which dataset is currently selected; controls search field visibility.
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
 * - SearchHandler: Uses `leaflet-geosearch` to allow address-based location search with marker and callback.
 *
 * Dependencies:
 * - Uses `react-redux`'s `useSelector` to access overlay URL from Redux state.
 * - Uses `react-leaflet` for map rendering and control hooks.
 * - Integrates `leaflet-geosearch` for geolocation search capability.
 */

/*
- SearchHandler component: A geolocation search bar powered by leaflet-geosearch (https://smeijer.github.io/leaflet-geosearch/)
- MapClickHandler component: Listens for user clicks on the map and extracts lat/lon for callbacks
- TileLayer component: Provides the base map (e.g. OSM tiles)
- ImageOverlay component: Displays a heatmap-style overlay image based on the selected week
- RecentOutbreakMarkers / HistoricOutbreakMarkers functions: Renders disease outbreak markers dynamically for the selected week
*/
export default function MapView({ onLocationSelect }: {onLocationSelect: (latLonString: string | null) => void} ): JSX.Element {
  const dataIndex = useSelector((state: RootState) => state.species.dataIndex);
  const week = useSelector((state: RootState) => state.timeline.week);

  const overlayUrl = useSelector((state: RootState) => state.map.overlayUrl);
  const showRecentOutbreaks = useSelector((state: RootState) => state.map.showRecentOutbreaks);
  const showHistoricOutbreaks = useSelector((state: RootState) => state.map.showHistoricOutbreaks);

  const [markerInfo, setmarkerInfo] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const isInflowOutflowView = dataIndex >= 2;

  const setMarker = (lat: number, lng: number, label: string) => {
    const latLon = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    setmarkerInfo({ lat, lng, label });
    onLocationSelect(latLon);
  };

  useEffect(() => {
    if (!isInflowOutflowView) {
      setmarkerInfo(null);
      onLocationSelect(null);
    }
  }, [isInflowOutflowView]);

  return (
    <div style={{ position: "relative" }}>
      <MapContainer
      // @ts-ignore
        center={{ lat: 45, lng: -95 }}
        zoom={3.5}
        style={{ height: "100vh", width: "100%" }}
        className="Map"
        keyboard={false}
        maxBounds={imageBounds}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          // @ts-ignore
          attribution='Abundance data © <a target="_blank" href="https://ebird.org/science/status-and-trends">eBird</a> | <a target="_blank" href="https://birdflow-science.github.io/">BirdFlow</a>'
        />
        {/* @ts-ignore */}
        <ImageOverlay url={overlayUrl} bounds={imageBounds} opacity={0.7} />

        {isInflowOutflowView && (
          <>
            <SearchHandler setMarker={setMarker} />
            <MapClickHandler setMarker={setMarker} />
          </>
        )}

        {markerInfo && (
          <Marker position={[markerInfo.lat, markerInfo.lng]}>
            <Popup>
              {markerInfo.label}<br />
              {markerInfo.lat.toFixed(2)}, {markerInfo.lng.toFixed(2)}
            </Popup>
          </Marker>
        )}

        <OutbreakPanes />
        {showRecentOutbreaks && RecentOutbreakMarkers(week)}
        {showHistoricOutbreaks && HistoricOutbreakMarkers(week)}
      </MapContainer>
    </div>
  );
}