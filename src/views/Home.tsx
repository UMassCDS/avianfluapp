import { Menu, ActionIcon } from '@mantine/core';
import { MapContainer, TileLayer, ImageOverlay } from 'react-leaflet';
import { useState, useEffect, useCallback } from 'react';
import { IconFileDatabase, IconFeather } from '@tabler/icons-react';
import { imageURL, DataTypes } from '../hooks/dataUrl';
import taxa from '../assets/taxa.json';
import Timeline from '../components/Timeline';
import Legend from '../components/Legend';
import '../styles/Home.css';
import 'leaflet/dist/leaflet.css';

const MAX_WEEK = 52;  // number of weeks in a year
const WEEK_TO_MSEC = 7*24*60*60*1000;

/* This is the main page and only page of the application. 
   Here, the map renders as well as all the AvianFluApp feature controls */
function Home(this: any) {
  // Sets the default position for the map.
  const position = {
    lat: 45,
    lng: -95,
  };

  // the lat/long bounds of the data image provided by the backend
  const imageBounds = [
    [9.622994, -170.291626],
    [79.98956, -49.783429],
  ];

  // Sets state for the data type - so far this is abundance or netmovement
  const [dataType, setDataType] = useState(DataTypes.ABUNDANCE);
  // Sets state for the species type 
  const [speciesType, setSpeciesType] = useState('mean');
  const today = new Date()
  const startOfYear = new Date(today.getFullYear(),0,1);
  // convert both dates into msec since 1970 and find the difference
  const diff_dates = today.valueOf()-startOfYear.valueOf()
  // Sets state for the week number
  let this_week = Math.floor(diff_dates/WEEK_TO_MSEC); 
  const [week, setWeek] = useState(this_week);
  // default state of the url for the current data displayed.
  const [url, setUrl] = useState(imageURL(DataTypes.ABUNDANCE, 'mean', this_week));

  // Adds a listener for the event in which a user presses a key on the keyboard. 
  useEffect(() => {
    const u = imageURL(dataType, speciesType, week);
    setUrl(u);
  }, [speciesType, dataType, week]);

  /* Allows the user to use the front and back arrow keys to control the week number 
     and which image files are being displayed. */ 
  const handleSelection = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        // increments active index (wraps around when at top)
        event.preventDefault();
        let temp = week + 1;
        if (temp > MAX_WEEK) temp = 1;
        setWeek(temp);
      } else if (event.key === 'ArrowLeft') {
        // decrements active index (wraps around when at bottom)
        event.preventDefault();
        let temp = week - 1;
        if (temp <= 0) temp = MAX_WEEK;
        setWeek(temp);
      }
    },[speciesType, dataType, week]
  );

  // Adds a listener for user keyboard events. 
  useEffect(() => {
    document.addEventListener('keydown', handleSelection);
    return () => {
      document.removeEventListener('keydown', handleSelection);
    };
  }, [handleSelection]);

  // Maps the species from the taxa file provided to a dropdown with options. 
  const taxaOptions = taxa.map((t) => (
    <Menu.Item key={t.value} onClick={() => setSpeciesType(t.value)}>
      {t.label}
    </Menu.Item>
  ));
  
  // Here is where you list the components and elements that you want rendered. 
  return (
    <div className="Home">
      {/* Calls the custom timeline component with the current week onChange function as parameters */}
      <Timeline week={week} onChangeWeek={setWeek} />
      {/* Calls the custom legend component with the data type and species type as parameters. */}
      <Legend dataType={dataType} speciesType={speciesType} />
      
      {/* Creates a map using the leaflet component */}
      <MapContainer
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        center={position}
        zoom={3.5}
        style={{ height: '100vh', width: '100%' }}
        className="Map"
        keyboard={false}
      >
       {/* Adds the attributions to the map */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          attribution='Abundance data provided by <a href="https://science.ebird.org/science/status-and-trends">Cornell Lab of Ornithology | eBird</a> | <a href="https://birdflow-science.github.io/"> BirdFlow </a>'
        />
        {/* Dropdown for data type */}
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
          {/* The options for the data type and the corresponsing onClick function call 
           TODO: add influx and outflux */}
          <Menu.Dropdown>
            <Menu.Item onClick={() => setDataType(DataTypes.ABUNDANCE)}>
              Abundance
            </Menu.Item>
            <Menu.Item onClick={() => setDataType(DataTypes.MOVEMENT)}>
              Net Movement
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
        {/* The dropdown for the species type */}
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
        { /* Overlays an image that contains the data to be displayed on top of the map */}
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
