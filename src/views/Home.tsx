import { Button } from '@mantine/core';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useState } from 'react';
import GeotiffLayer from '../components/GeorasterLayerCustom';
import '../styles/Home.css';
import 'leaflet/dist/leaflet.css';

function Home(this: any) {
  const position = {
    lat: 45,
    lng: -95,
  };

  const urlBase =
    'https://avianinfluenza.s3.us-east-2.amazonaws.com/ducks/real/buwtea_distr';
  const [url, setUrl] = useState(
    'https://avianinfluenza.s3.us-east-2.amazonaws.com/ducks/real/buwtea_distr_01'
  );

  const [num, setNum] = useState(1); 

  const onClickPrevTiff = () => {
    const n = num - 1;
    setNum(n);
    const pad = '00';
    const ans = pad.substring(0, pad.length - n.toString().length) + n;
    setUrl(`${urlBase}_${ans}`);
  };

  const onClickNextTiff = () => {
    const n = num + 1;
    setNum(n);
    const pad = '00';
    const ans = pad.substring(0, pad.length - n.toString().length) + n;
    setUrl(`${urlBase}_${ans}`);
  };

  return (
    <div className="Home">
      <MapContainer
        center={position}
        zoom={3.5}
        style={{ height: '100vh', width: '100%' }}
      >
        <Button className="prevButton" onClick={onClickPrevTiff}>
          Previous TIFF
        </Button>
        <Button className="nextButton" onClick={onClickNextTiff}>
          Next TIFF
        </Button>
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeotiffLayer key={num} url={url} />
      </MapContainer>
    </div>
  );
}

export default Home;
