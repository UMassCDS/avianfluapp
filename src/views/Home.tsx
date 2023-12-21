import { Title, Button } from '@mantine/core';
import { MapContainer, TileLayer } from 'react-leaflet';
import GeotiffLayer from '../components/GeorasterLayerCustom';

function Home() {
  const url = '/imgs/amewoo_distr_01.tif';
  const options = {
    resolution: 64,
    opacity: 1,
  };

  return (
    <div className="Home">
      <Title>Avian Flu App</Title>
      <Button>Click Me!</Button>
      <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={url}
        />
        <GeotiffLayer url={url} options={options} />
      </MapContainer>
    </div>
  );
}

export default Home;
