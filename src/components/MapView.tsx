import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";
import { MapContainer, TileLayer, Marker, Popup, ImageOverlay, useMap } from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { GeoTIFFImage } from "geotiff";
import { RootState } from "../store/store";
import { OutbreakMarkers } from "./OutbreakPoints";
import { lngLatToMercator } from '../utils/utils'
import MaskGeoTIFFLayer from "./MaskGeoTIFFLayer";
import { FLOW_SEARCH_SLOT_ID } from "./FlowSearchSlot";


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
    const handleClick = async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      await setMarker(lat, lng, "Selected Location:");
    };

    map.on("click", handleClick);
    return () => map.off("click", handleClick);
  }, [map, setMarker]);

  return null;
}

function SearchHandler({ setMarker }: { setMarker: (lat: number, lng: number, label: string) => void }) {
  const map = useMap();
  const setMarkerRef = useRef(setMarker);
  setMarkerRef.current = setMarker;

  useEffect(() => {
    // @ts-ignore
    const searchControl = new GeoSearchControl({
      provider: new OpenStreetMapProvider(),
      style: "button",
      maxSuggestions: 2,
      showMarker: false,
      retainZoomLevel: true,
      notFoundMessage: "Sorry, that address could not be found.",
      resetButton: "↺",
    });

    map.addControl(searchControl);
    // Relocate the search control into toolbar
    const slot = document.getElementById(FLOW_SEARCH_SLOT_ID);
    if (slot) slot.appendChild((searchControl as any).getContainer());
    const control = searchControl as any;
    const container: HTMLElement = control.getContainer();

    // reset button clears typed text
    const handleResetClick = (e: Event) => {
      if (e.target !== control.resetButton) return;
      e.stopPropagation();
      e.preventDefault();
      control.clearResults(null, true);
      control.searchElement.input.focus();
    };
    control.searchElement.form.addEventListener('click', handleResetClick, true);

    // clicking anywhere outside the search closes it
    const handleOutsidePress = (e: Event) => {
      if (!container.classList.contains('active')) return;
      if (container.contains(e.target as Node)) return;
      control.close();
    };
    document.addEventListener('pointerdown', handleOutsidePress, true);

    const handleSearch = async (result: any) => {
      const { x, y, label } = result.location;
      await setMarkerRef.current(y, x, label); // y = lat, x = lng
    };

    map.on("geosearch/showlocation", handleSearch);

    return () => {
      document.removeEventListener('pointerdown', handleOutsidePress, true);
      control.searchElement.form.removeEventListener('click', handleResetClick, true);
      map.removeControl(searchControl);
      map.off("geosearch/showlocation", handleSearch);
    };
  }, [map]);

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
- OutbreakMarkers function: Renders disease outbreak markers dynamically for the selected week
*/
export default function MapView({ onLocationSelect }: {onLocationSelect: (latLonString: string | null) => void} ): JSX.Element {
  const dataIndex = useSelector((state: RootState) => state.species.dataIndex);
  const week = useSelector((state: RootState) => state.timeline.week);

  const overlayUrl = useSelector((state: RootState) => state.map.overlayUrl);
  const [flowMaskGeoTIFFImage, setFlowMaskGeoTIFFImage]  = useState<GeoTIFFImage | null>(null);

  const [markerInfo, setmarkerInfo] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const isInflowOutflowView = dataIndex >= 2;

  // invalid selection message shown at the mouse position
  const mousePos = useRef({ x: 0, y: 0 });
  const [invalidMsg, setInvalidMsg] = useState<{ x: number; y: number; id: number } | null>(null);

  useEffect(() => {
    const track = (e: MouseEvent) => { mousePos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', track);
    return () => window.removeEventListener('mousemove', track);
  }, []);

  useEffect(() => {
    if (!invalidMsg) return;
    const t = setTimeout(() => setInvalidMsg(null), 1000);
    return () => clearTimeout(t);
  }, [invalidMsg]);

  // Utility to check if a marker is in valid mask region
  const isValidMaskPoint = async (lat: number, lng: number) => {
    if (!flowMaskGeoTIFFImage) return true; // if no mask, allow

    const bounds = flowMaskGeoTIFFImage.getBoundingBox();
    const width = flowMaskGeoTIFFImage.getWidth();
    const height = flowMaskGeoTIFFImage.getHeight();
    const [xMin, yMin, xMax, yMax] = bounds;
    const [mx, my] = lngLatToMercator(lng, lat);

    const px = Math.round(((mx - xMin) / (xMax - xMin)) * (width - 1));
    const py = Math.round(((yMax - my) / (yMax - yMin)) * (height - 1));

    if (px < 0 || py < 0 || px >= width || py >= height) return false;
    try {
      // Read current week's band
      const raster = await flowMaskGeoTIFFImage.readRasters({ samples: [week + 1] });
      const data = raster[0];
      // @ts-ignore 
      return data[py * width + px] === 1;
    } catch (err) {
      return true; // fallback, allow
    }
  };

  // Modify setMarker to check mask
  const setMarker = async (lat: number, lng: number, label: string) => {
    if (isInflowOutflowView) {
      const valid = await isValidMaskPoint(lat, lng);
      if (!valid) {
        setInvalidMsg({ ...mousePos.current, id: Date.now() });
        setmarkerInfo(null);
        onLocationSelect(null);
        return;
      }
    }
    const latLon = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    setmarkerInfo({ lat, lng, label });
    onLocationSelect(latLon);
  };

  return (
    <div style={{ position: "relative" }}>
      <MapContainer
      // @ts-ignore
        center={{ lat: 45, lng: -95 }}
        zoom={3.5}
        minZoom={3.5}
        zoomControl={false}
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
        {overlayUrl && <ImageOverlay url={overlayUrl} bounds={imageBounds} opacity={0.7} />}

        {isInflowOutflowView && (
          <>
            <MaskGeoTIFFLayer setFlowMaskGeoTIFFImage={setFlowMaskGeoTIFFImage}/>
            <SearchHandler setMarker={setMarker} />
            <MapClickHandler setMarker={setMarker} />
          </>
        )}

        {markerInfo && isInflowOutflowView && (
          <Marker position={[markerInfo.lat, markerInfo.lng]}>
            <Popup>
              {markerInfo.label}<br />
              {markerInfo.lat.toFixed(2)}, {markerInfo.lng.toFixed(2)}
            </Popup>
          </Marker>
        )}

        <OutbreakPanes />
        <OutbreakMarkers />
      </MapContainer>

      {invalidMsg && (
        <div
          key={invalidMsg.id}
          role="alert"
          style={{
            position: 'fixed',
            left: Math.min(invalidMsg.x + 12, window.innerWidth - 190),
            top: invalidMsg.y + 12,
            zIndex: 2000,
            maxWidth: 160,
            pointerEvents: 'none',
          }}
          className="invalid-location-msg bg-gray-700 text-white px-2 py-1 text-[11px] leading-tight"
        >
          Please select a location within the highlighted area.
        </div>
      )}
    </div>
  );
}