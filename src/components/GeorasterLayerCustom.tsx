import { useEffect, useRef } from 'react';
import { useLeafletContext } from '@react-leaflet/core';
import { useMap } from 'react-leaflet';
import parseGeoraster from 'georaster';
import GeoRasterLayer from 'georaster-layer-for-leaflet';
import 'leaflet/dist/leaflet.css';
import chroma from 'chroma-js';

interface GeotiffLayerProps {
  url: string;
}
// eslint-disable-next-line react/prop-types
function GeotiffLayer(props: GeotiffLayerProps) {
  const context = useLeafletContext();
  const map = useMap();
  const { url } = props;

  useEffect(() => {
    const container = context.layerContainer || context.map;

    fetch(`${url}.tif`, {
      method: 'GET',
      headers: {
        'Content-Type': 'image/geotiff',
      },
    })
      .then((response) => response.blob())
      .then((blob: any) => {
        parseGeoraster(blob).then((georaster: any) => {
          const layerVal = 0;
          const min = georaster.mins[layerVal];
          const max = georaster.maxs[layerVal];
          const range = georaster.ranges[layerVal];
          const transparent = chroma.rgb(242, 239, 233).alpha(0);
          const scale = chroma.scale([transparent, 'blue', 'yellow']);
          // eslint-disable-next-line no-param-reassign, react/prop-types
          // options.georaster = georaster;
          const layer = new GeoRasterLayer({
            georaster,
            opacity: 0.7,
            pixelValuesToColorFn(pixelValues: any[]) {
              const pixelValue = pixelValues[layerVal]; // there's just one band in this raster

              if (pixelValue === 0) return null;

              // if there's zero wind, don't return a color
              // eslint-disable-next-line no-restricted-globals
              if (isNaN(pixelValue)) return null;

              // darker values higher and lighter values lower

              // scale to 0 - 1 used by chroma
              const scaledPixelValue = (pixelValue - min) / range;

              const color = scale(scaledPixelValue);

              return color;
            },
            resolution: 256, // optional parameter for adjusting display resolution
          });
          container.addLayer(layer);
          // map.fitBounds(layer.getBounds());

          // map.fitBounds(layer.getBounds());
        });
      });
  }, [context, map, url]);

  return null;
}

export default GeotiffLayer;
