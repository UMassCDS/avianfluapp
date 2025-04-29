import { ImageOverlay, MapContainer, TileLayer, useMap } from "react-leaflet";
import { OutbreakMarkers } from "./OutbreakPoints";
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { useEffect } from "react";

const imageBounds = [
  [9.622994, -170.291626],
  [79.98956, -49.783429],
];

interface MapViewProps {
  overlayUrl: string;
  week: number;
  dataIndex: number;
}

export default function MapView({ overlayUrl, week, dataIndex }: MapViewProps): JSX.Element {
  const position = {
    lat: 45,
    lng: -95,
  };
  const showSearch = dataIndex >= 2;

  const SearchField = ({ enabled }: { enabled: boolean }) => {
    const provider = new OpenStreetMapProvider();
  
    // @ts-ignore
    const searchControl = new GeoSearchControl({
      provider: provider,
      style: 'button',
      showPopup: true,
      retainZoomLevel: true,
      notFoundMessage: 'Sorry, that address could not be found.',
    });
  
    const map = useMap();
    useEffect(() => {
      console.log("SearchField: enabled: ", enabled);
      if (!enabled) return;    // nothing to do
      console.log("dog")

      map.addControl(searchControl);
      
      map.on('geosearch/showlocation', (result: any) => {
        console.log('Search result:', result.location);
        // {
        //   x: longitude,
        //   y: latitude,
        // }
      });
  
      return () => {
        map.removeControl(searchControl);
        map.off('geosearch/showlocation'); // Clean up listener
      };
    }, [enabled, map]);
  
    return null;
  };

  return (
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
      <SearchField enabled={showSearch} />
      {/* Adds the attributions to the map */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        attribution='Abundance data provided by <a target="_blank" href="https://ebird.org/science/status-and-trends ">Cornell Lab of Ornithology - eBird</a> | <a target="_blank" href="https://birdflow-science.github.io/"> BirdFlow </a>'
      />
      {/* Overlays an image that contains the data to be displayed on top of the map */}
      <ImageOverlay
        url={overlayUrl}
        bounds={imageBounds}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        opacity={0.7}
      />
      {OutbreakMarkers(week)}
    </MapContainer>
  );
}