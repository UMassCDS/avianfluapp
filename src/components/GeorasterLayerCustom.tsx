import { useEffect, useRef } from 'react';
import { useLeafletContext } from '@react-leaflet/core';
import { useMap } from 'react-leaflet';
import parseGeoraster from 'georaster';
import GeoRasterLayer from 'georaster-layer-for-leaflet';

interface GeotiffLayerProps {
  url: string;
  options: {
    resolution: number;
    opacity: number;
    georaster?: unknown;
  };
}
// eslint-disable-next-line react/prop-types
function GeotiffLayer(props: GeotiffLayerProps) {
  const geoTiffLayerRef = useRef();
  const context = useLeafletContext();
  const map = useMap();
  const { url, options } = props;

  useEffect(() => {
    const container = context.layerContainer || context.map;

    // map.fitBounds(layer.getBounds());
    const totalUrl = window.location.origin.toString() + url;
    fetch(totalUrl)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => {
        parseGeoraster(arrayBuffer).then((georaster: any) => {
          console.log('georaster:', georaster);
          // eslint-disable-next-line no-param-reassign, react/prop-types
          options.georaster = georaster;
          const layer = new GeoRasterLayer({
            georaster,
            opacity: 0.7,
            pixelValuesToColorFn: (values) =>
              values[0] === 42 ? '#ffffff' : '#000000',
            resolution: 64, // optional parameter for adjusting display resolution
          });
          container.addLayer(layer);

          // map.fitBounds(layer.getBounds());
        });
      });
  }, [context, url, map, options]);

  return null;
}

export default GeotiffLayer;
