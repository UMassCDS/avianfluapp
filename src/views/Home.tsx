import { Button, Drawer } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useState } from 'react';
import GeotiffLayer from '../components/GeorasterLayerCustom';
import DrawerContents from '../components/DrawerContents';
import { abundanceUrl } from '../hooks/abundanceUrl';
import '../styles/Home.css';
import 'leaflet/dist/leaflet.css';

function Home(this: any) {
  const position = {
    lat: 45,
    lng: -95,
  };

  /*   const urlBase =
      'https://avianinfluenza.s3.us-east-2.amazonaws.com/ducks/real/buwtea_distr'; */
  const [url, setUrl] = useState('');

  /* const [num, setNum] = useState(1);

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
  }; */

  const [opened, { open, close }] = useDisclosure(false);

  const onSubmitDrawer = (vals: any) => {
    const u = abundanceUrl(vals);
    setUrl(u);
    close();
  };

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
        <GeotiffLayer key={1} url={url} />
      </MapContainer>
    </div>
  );
}

export default Home;
