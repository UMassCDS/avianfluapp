import { Combobox, Input, InputBase, useCombobox } from '@mantine/core';
import { MapContainer, TileLayer, ImageOverlay } from 'react-leaflet';
import { useState, useEffect } from 'react';
import { imageURL, getScalingFilename, dataInfo} from '../hooks/dataUrl';
import taxa from '../assets/taxa.json';
import Timeline from '../components/Timeline';
import Legend from '../components/Legend';
import '../styles/Home.css';
import 'leaflet/dist/leaflet.css';

const MAX_WEEK = 52;  // number of weeks in a year
const WEEK_TO_MSEC = 7*24*60*60*1000;
// the lat/long bounds of the data image provided by the backend
const imageBounds = [
  [9.622994, -170.291626],
  [79.98956, -49.783429],
];

/* This is the main page and only page of the application. 
   Here, the map renders as well as all the AvianFluApp feature controls */
function Home(this: any) {
  // Sets the default position for the map.
  const position = {
    lat: 45,
    lng: -95,
  };
  // Initialize data type - so far this is abundance or netmovement
  const [dataIndex, setDataIndex] = useState(0);
  // Sets state for the species type 
  const [speciesIndex, setSpeciesIndex] = useState(0);
  // determine current week - find msec between today and beginning fo the year
  const today = new Date()
  const startOfYear = new Date(today.getFullYear(),0,1);
  const diff_dates = today.valueOf()-startOfYear.valueOf()
  // Sets state for the week number
  let this_week = Math.floor(diff_dates/WEEK_TO_MSEC); 
  const [week, setWeek] = useState(this_week);
  // default state of the map overlay url for the current data displayed.
  const [overlayUrl, setOverlayUrl] = useState(imageURL(0, 0, this_week));
  const typeCombo = useCombobox();
  const speciesCombo = useCombobox();

  /* Allows the user to use the front and back arrow keys to control the week number 
     and which image files are being displayed. */ 
  const handleSelection = (event: KeyboardEvent) => {
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
  };

  // Called once on startup. Adds a listener for user keyboard events. 
  useEffect(() => {
    document.addEventListener('keydown', handleSelection);
    return () => {
      document.removeEventListener('keydown', handleSelection);
    };
  }, []);

  async function checkImageAndUpdate(this_week: number) {
    var image_url = imageURL(dataIndex, speciesIndex, this_week);
    var response = await fetch(image_url);
    if (!response.ok) {
      console.debug(response);
      var message = "The .png for week "+this_week+" on "+dataInfo[dataIndex].label+" of "+taxa[speciesIndex].label+" is missing.";
      alert(message);
      return;
    }
    setWeek(this_week);
    setOverlayUrl(image_url);
  }

  useEffect(() => {
    checkImageAndUpdate(week);
  }, [dataIndex, speciesIndex]);

  async function checkInputTypes(d_index: number, s_index: number) {
    // check required legend file is available. 
    var response;
    if ((d_index !== dataIndex) || (s_index !== speciesIndex)) {
      response = await fetch(getScalingFilename(d_index, s_index));
      if (!response.ok) {
        console.debug(response);
        var message = "The scale file for "+dataInfo[d_index].label+" of "+taxa[s_index].label+" is missing.";
        alert(message);
        return;
      }
    }
    typeCombo.selectedOptionIndex = d_index;
    speciesCombo.selectedOptionIndex = s_index;
    setDataIndex(d_index);
    setSpeciesIndex(s_index);
  };

  // Maps the species from the taxa file provided to a dropdown with options. 
  const speciesOptions = taxa.map((t, index) => (
    <Combobox.Option value={index.toString()} key={t.value}>
      {t.label}
    </Combobox.Option>
  ));

  // maps data types (abundance, movement etc) to dropdown
  const dataTypeOptions = dataInfo.map((dt, index) => (
    <Combobox.Option value={index.toString()} key={index}>
      {dt.label}
    </Combobox.Option>
  ));
  
  // PAM could consolidate a bunch of the combo box after positioning is right
  // Here is where you list the components and elements that you want rendered. 
  return (
    <div className="Home">
      <div className="title">
        <div style={{textAlign:"center", fontSize:60, fontWeight:"bold"}}>Avian Influenza</div>
        <div style={{textAlign:"center", fontSize:30, fontWeight:"bold"}}>{dataInfo[dataIndex].label} of the {taxa[speciesIndex].label}</div>
      </div>
      {/* Calls the custom timeline component with the current week onChange function as parameters */}
      <Timeline week={week} onChangeWeek={checkImageAndUpdate} />
      {/* Calls the custom legend component with the data type and species type as parameters. */}
      <Legend dataTypeIndex={dataIndex} speciesIndex={speciesIndex} />
      {/* Creates a map using the leaflet component */}
      <MapContainer
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        center={position}
        zoom={3.5}
        style={{ height: '100vh', width: '100%' }}
        className="Map"
        keyboard={false}
        maxBounds={imageBounds}
      >
       {/* Adds the attributions to the map */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          attribution='Abundance data provided by <a target="_blank" href="https://ebird.org/science/status-and-trends ">Cornell Lab of Ornithology - eBird</a> | <a target="_blank" href="https://birdflow-science.github.io/"> BirdFlow </a>'
        />
        {/* Dropdown for data type */}
        <Combobox
          store={typeCombo}
          onOptionSubmit={(val) => {
            let di = Number.parseInt(val);
            checkInputTypes(di, speciesIndex);
            typeCombo.closeDropdown();
          }}
        >
          <Combobox.Target>
            <InputBase
             className="dataIndex-button"
              component="button"
              type="button"
              pointer
              leftSection={<Combobox.Chevron />}
              onClick={() => typeCombo.toggleDropdown()}
              leftSectionPointerEvents="none"
            >
              {dataInfo[dataIndex].label || <Input.Placeholder>Pick value</Input.Placeholder>}
            </InputBase>
          </Combobox.Target>

          <Combobox.Dropdown>
            <Combobox.Options>{dataTypeOptions}</Combobox.Options>
          </Combobox.Dropdown>
        </Combobox>      

        {/* The dropdown for the species type */}
        <Combobox
          store={speciesCombo}
          onOptionSubmit={(val) => {
            let si = Number.parseInt(val); 
            checkInputTypes(dataIndex, si) 
            speciesCombo.closeDropdown();
          }}
        >
          <Combobox.Target>
            <InputBase
             className="speciesType-button"
              component="button"
              type="button"
              pointer
              leftSection={<Combobox.Chevron />}
              onClick={() => speciesCombo.toggleDropdown()}
              leftSectionPointerEvents="none"
            >
              {taxa[speciesIndex].label || <Input.Placeholder>Pick value</Input.Placeholder>}
            </InputBase>
          </Combobox.Target>

          <Combobox.Dropdown>
            <Combobox.Options>{speciesOptions}</Combobox.Options>
          </Combobox.Dropdown>
        </Combobox>      

        { /* Overlays an image that contains the data to be displayed on top of the map */}
        <ImageOverlay
          url={overlayUrl}
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
