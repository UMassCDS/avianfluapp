import { Menu, ActionIcon } from '@mantine/core';
import { MapContainer, TileLayer, ImageOverlay } from 'react-leaflet';
import { DatePickerInput } from '@mantine/dates';
import { useState } from 'react';
import { IconFileDatabase, IconFeather } from '@tabler/icons-react';
import moment from 'moment';
import { changeURL } from '../hooks/abundanceUrl';
import taxa from '../assets/taxa.json';
import '../styles/Home.css';
import 'leaflet/dist/leaflet.css';

function Home(this: any) {
  const position = {
    lat: 45,
    lng: -95,
  };

  const [url, setUrl] = useState(
    'https://avianinfluenza.s3.us-east-2.amazonaws.com/abundance/mean/abundance_mean_1.png'
  );

  const [dataType, setDataType] = useState('abundance');
  const [speciesType, setSpeciesType] = useState('mean');
  const [week, setWeek] = useState('1');

  const onClickSpecies = (val: string) => {
    const u = changeURL(dataType, val, week);
    setSpeciesType(val);
    setUrl(u);
  };

  const onClickDataType = (val: string) => {
    const u = changeURL(val, speciesType, week);
    setDataType(val);
    setUrl(u);
  };

  const onClickDate = (val: Date) => {
    const w = moment(val).format('W');
    console.log(w);
    const u = changeURL(dataType, speciesType, w);
    setWeek(w);
    setUrl(u);
  };

  const imageBounds = [
    [9.622994, -170.291626],
    [79.98956, -49.783429],
  ];

  const taxaOptions = taxa.map((t) => (
    <Menu.Item key={t.value} onClick={() => onClickSpecies(t.value)}>
      {t.label}
    </Menu.Item>
  ));
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
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <DatePickerInput
          clearable
          onChange={(value) => value && onClickDate(value)}
          label="Date input"
          placeholder="Date input"
          className="date-button"
        />
        <Menu position="left-start" withArrow>
          <Menu.Target>
            <ActionIcon
              className="dataType-button"
              variant="filled"
              aria-label="Data Type"
            >
              <IconFileDatabase
                style={{ width: '70%', height: '70%' }}
                stroke={1.5}
              />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={() => onClickDataType('abundance')}>
              Abundance
            </Menu.Item>
            <Menu.Item onClick={() => onClickDataType('netmovement')}>
              Net Movement
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
        <Menu position="left-start" withArrow>
          <Menu.Target>
            <ActionIcon
              className="speciesType-button"
              variant="filled"
              aria-label="Data Type"
            >
              <IconFeather
                style={{ width: '70%', height: '70%' }}
                stroke={1.5}
              />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>{taxaOptions}</Menu.Dropdown>
        </Menu>

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
