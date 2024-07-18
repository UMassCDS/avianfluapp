import { Menu, ActionIcon } from '@mantine/core';
import { MapContainer, TileLayer, ImageOverlay } from 'react-leaflet';
import { useState, useEffect, useCallback } from 'react';
import { IconFileDatabase, IconFeather } from '@tabler/icons-react';
import { changeURL } from '../hooks/abundanceUrl';
import taxa from '../assets/taxa.json';
import Timeline from '../components/Timeline';
import Legend from '../components/Legend';
import '../styles/Home.css';
import 'leaflet/dist/leaflet.css';

/* This is the main page and only page of the application. Here, the map renders as well as all the AvianFluApp feature controls */
function Home(this: any) {
  
  // Sets the default position for the map.
  const position = {
    lat: 45,
    lng: -95,
  };

  // Calls the useState hook provided by React to create state for and set the default state of the url for the current data displayed.
  
  const [url, setUrl] = useState(
    'https://avianinfluenza.s3.us-east-2.amazonaws.com/abundance/mean/abundance_mean_1.png'
  );
  
  //Sets state for the data type 
  const [dataType, setDataType] = useState('abundance');
  //Sets state for the species type 
  const [speciesType, setSpeciesType] = useState('mean');
  //Sets state for the week number
  const [week, setWeek] = useState('1');

  /* onClick function for the Species dropdown. When you click on a species, it updates the species state and url state to reflect the changes. */
  const onClickSpecies = (val: string) => {
    const u = changeURL(dataType, val, week);
    setSpeciesType(val);
    setUrl(u);
  };

  /* onClick function for the data type dropdown. When you select a data type, it updates the data state as well as the url. */
  const onClickDataType = (val: string) => {
    const u = changeURL(val, speciesType, week);
    setDataType(val);
    setUrl(u);
  };

  /* onClick function for the week number. When you change the week by sliding the timeline or using arrow keys, it uodstes the week number and the url. */ 
  const onClickWeek = (val: string) => {
    const u = changeURL(dataType, speciesType, val);
    setWeek(val);
    setUrl(u);
  };
  
  // the bounds of the data image provided by the backend
  const imageBounds = [
    [9.622994, -170.291626],
    [79.98956, -49.783429],
  ];

  /* Allows the user to use the front and back arrow keys to control the week number and which image files are being displayed. */ 
  const handleSelection = useCallback(
    (event: KeyboardEvent) => {
      const { key } = event;
      const arrowLeftPressed = key === 'ArrowLeft';
      const arrowRightPressed = key === 'ArrowRight';

      // increments active index (wraps around when at top)
      if (arrowLeftPressed) {
        event.preventDefault();
        let temp = parseInt(week, 10) - 1;
        if (temp <= 0) temp = 52;
        const u = changeURL(dataType, speciesType, temp.toString());
        setWeek(temp.toString());
        setUrl(u);

        // decrements active index (wraps around when at bottom)
      } else if (arrowRightPressed) {
        event.preventDefault();
        let temp = parseInt(week, 10) + 1;
        if (temp >= 53) temp = 1;
        const u = changeURL(dataType, speciesType, temp.toString());
        setWeek(temp.toString());
        setUrl(u);
      }
    },
    [dataType, speciesType, week]
  );

  // Adds a listener for the event in which a user presses a key on the keyboard. 
  useEffect(() => {
    document.addEventListener('keydown', handleSelection);

    return () => {
      document.removeEventListener('keydown', handleSelection);
    };
  }, [handleSelection]);

  // Maps the species from the taxa file provided to a dropdown with options. 
  const taxaOptions = taxa.map((t) => (
    <Menu.Item key={t.value} onClick={() => onClickSpecies(t.value)}>
      {t.label}
    </Menu.Item>
  ));
  
  // Here is where you list the components and elements that you want rendered. 
  return (
    <div className="Home">
      {/* Calls the custom timeline component with the current week onChange function as parameters */}
      <Timeline week={parseInt(week, 10)} onChangeWeek={onClickWeek} />
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
            <Menu.Item onClick={() => onClickDataType('abundance')}>
              Abundance
            </Menu.Item>
            <Menu.Item onClick={() => onClickDataType('netmovement')}>
              Net Movement
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
        {/*The dropdown for the species type */}
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
