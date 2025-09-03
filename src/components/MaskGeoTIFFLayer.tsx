import { useEffect, useState } from "react";
import { ImageOverlay } from "react-leaflet";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import * as GeoTIFF from "geotiff";
import taxa from "../assets/taxa.json";
import { mercatorToLatLng } from '../utils/utils'

const USE_PREGENERATED_MASK_OVERLAY = false; // or false to use GeoTIFF
const BASE_URL = 'https://avianinfluenza.s3.us-east-2.amazonaws.com';


export default function MaskLayer({ setFlowMaskGeoTIFFImage } : {
  setFlowMaskGeoTIFFImage: (image: GeoTIFF.GeoTIFFImage | null) => void;
}) {
  const week = useSelector((state: RootState) => state.timeline.week);
  const speciesIndex = useSelector((state: RootState) => state.species.speciesIndex);
  const dataIndex = useSelector((state: RootState) => state.species.dataIndex);
  const flowResults = useSelector((state: RootState) => state.map.flowResults);

  const [maskUrl, setMaskUrl] = useState<string | null>(null);
  const [imageBounds, setImageBounds] = useState<any>(null);

  const isInflowOutflowView = dataIndex >= 2;
  const shouldShowMask = isInflowOutflowView && (!Array.isArray(flowResults) || flowResults.length === 0);
  const taxaValue = taxa[speciesIndex]?.value;

  // Fetch GeoTIFF image and compute bounds for overlay
  useEffect(() => {
    setMaskUrl(null);
    setImageBounds(null);

    if (!shouldShowMask || !taxaValue) return;

    async function loadGeoTIFF() {
      try {
        const geotiffUrl = `${BASE_URL}/mask_in/${taxaValue}/mask_in_${taxaValue}.tif`;
        const pregenPngUrl = `${BASE_URL}/mask_in/${taxaValue}/mask_in_${taxaValue}_${week+1}.png`;

        // Load GeoTIFF
        const tiff = await GeoTIFF.fromUrl(geotiffUrl);
        const image = await tiff.getImage();
        const bounds = image.getBoundingBox();
        const sw = mercatorToLatLng(bounds[0], bounds[1]);
        const ne = mercatorToLatLng(bounds[2], bounds[3]);
        setFlowMaskGeoTIFFImage(image);
        setImageBounds([sw, ne]);

        if (USE_PREGENERATED_MASK_OVERLAY) {
          // Use Pregenerated PNG as overlay
          setMaskUrl(pregenPngUrl);
          return;
        }

        // Generate overlay PNG from GeoTIFF
        const raster = await image.readRasters({ samples: [week] });
        const data = raster[0] as Uint8Array;

        const width = image.getWidth();
        const height = image.getHeight();
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        const imgData = ctx.createImageData(width, height);

        for (let i = 0; i < data.length; i++) {
          const val = data[i];
          const idx = i * 4;
          if (val === 1) {
            // VALID AREA: Bright overlay
            imgData.data[idx] = 0;    // R
            imgData.data[idx + 1] = 255;  // G
            imgData.data[idx + 2] = 0;    // B
            imgData.data[idx + 3] = 255;  // Alpha (opacity)
          } else {
            // INVALID AREA: Fully transparent
            imgData.data[idx + 3] = 0;
          }
        }
        ctx.putImageData(imgData, 0, 0);
        setMaskUrl(canvas.toDataURL());
      } catch (err) {
        console.error('GeoTIFF error:', err);
      }
    }
    loadGeoTIFF();
  }, [taxaValue, shouldShowMask, week]);

  if (!shouldShowMask || !maskUrl || !imageBounds) return null;

  // @ts-ignore
  return <ImageOverlay url={maskUrl} bounds={imageBounds} opacity={0.25} />;
}
