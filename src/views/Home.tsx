import { Button, Drawer } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { MapContainer, TileLayer, ImageOverlay } from 'react-leaflet';
import { useState } from 'react';
import DrawerContents from '../components/DrawerContents';
import { abundanceUrl } from '../hooks/abundanceUrl';
import '../styles/Home.css';
import 'leaflet/dist/leaflet.css';

function Home(this: any) {
  const position = {
    lat: 45,
    lng: -95,
  };

  const [url, setUrl] = useState('');

  const [opened, { open, close }] = useDisclosure(false);

  const onSubmitDrawer = (vals: any) => {
    const u = abundanceUrl(vals);
    setUrl(u);
    close();
  };

  const imageBounds = [
    [9.622994, -170.291626],
    [79.98956, -49.783429],
  ];
  return (
    <div className="Home">
      <MapContainer
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        center={position}
        zoom={3.5}
        style={{ height: '100vh', width: '100%' }}
        className="Map"
      >
        <Drawer className="drawerComponent" opened={opened} onClose={close}>
          <DrawerContents onSubmit={onSubmitDrawer} />
        </Drawer>

        <Button className="drawerButton" onClick={open}>
          Data Control
        </Button>

        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <ImageOverlay
          url={url}
          bounds={imageBounds}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          opacity={0.7}
        />
      </MapContainer>
    </div>
  );
}

export default Home;
