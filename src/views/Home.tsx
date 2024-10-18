import { Menu, ActionIcon } from '@mantine/core';
import { Combobox, Input, InputBase, useCombobox } from '@mantine/core';
import { MapContainer, TileLayer, ImageOverlay } from 'react-leaflet';
import { useState, useEffect } from 'react';
import { IconFileDatabase, IconFeather } from '@tabler/icons-react';
import { imageURL, changeLegend, dataTypeEnum, dataInfo, stupidConversion} from '../hooks/dataUrl';
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
  const [dataType, setDataType] = useState(dataTypeEnum.ABUNDANCE);
  // Sets state for the species type 
  const [speciesType, setSpeciesType] = useState(taxa[0].value);
  const [speciesName, setSpeciesName] = useState(taxa[0].label);
  const today = new Date()
  const startOfYear = new Date(today.getFullYear(),0,1);
  // convert both dates into msec since 1970 and find the difference
  const diff_dates = today.valueOf()-startOfYear.valueOf()
  // Sets state for the week number
  let this_week = Math.floor(diff_dates/WEEK_TO_MSEC); 
  const [week, setWeek] = useState(this_week);
  // default state of the map overlay url for the current data displayed.
  const [overlayUrl, setOverlayUrl] = useState(imageURL(dataTypeEnum.ABUNDANCE, taxa[0].value, this_week));
  const typeCombo = useCombobox();
  // const speciesCombo = useCombobox();

  async function checkForImage(this_week: number) {
    var image_url = imageURL(dataType, speciesType, this_week);
    var response = await fetch(image_url);
    if (!response.ok) {
      console.debug(response);
      var message = "The .png for week "+this_week+" on "+dataInfo[dataType].label+" of "+speciesName+" is missing.";
      alert(message);
      return;
    }
    setWeek(this_week);
    setOverlayUrl(image_url);
  }

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

  // Adds a listener for user keyboard events. 
  useEffect(() => {
    document.addEventListener('keydown', handleSelection);
    return () => {
      document.removeEventListener('keydown', handleSelection);
    };
  }, []);

  useEffect(() => {
    checkForImage(week);
  }, [dataType, speciesType]);

  async function checkInputTypes(data_type: dataTypeEnum, species: string, label: string) {
    // check required legend file is available. 
    var response;
    if ((data_type !== dataType) || (species !== speciesType)) {
      response = await fetch(changeLegend(data_type, species));
      if (!response.ok) {
        console.debug(response);
        var message = "The scale file for "+dataInfo[data_type].label+" of "+label+" is missing.";
        alert(message);
        return;
      }
    }
    setDataType(data_type);
    setSpeciesType(species);
    setSpeciesName(label);
  };


  PAM rethink this.  should we do a load up front for scale data? then create all of hte legends upfront
  Can use whether legend exists to check if we can do this Combo. No await. MAybe 
  // PAM these should only happen once  - this doesn't change
  // Maps the species from the taxa file provided to a dropdown with options. 
  const taxaOptions = taxa.map((t) => (
    <Menu.Item key={t.value} onClick={() => checkInputTypes(dataType, t.value, t.label)}>
      {t.label}
    </Menu.Item>
  ));
  
  async function checkDataType(data_type: dataTypeEnum) {
    // check required legend file is available. 
    var response = await fetch(changeLegend(data_type, speciesType));
    if (!response.ok) {
      console.debug(response);
      var message = "The scale file for "+dataInfo[data_type].label+" of "+speciesName+" is missing.";
      alert(message);
      return false;
    }
    return true;
  };

  // Maps the data types (total, migration, flux) to a dropdown with options. 
  function dataTypeOptions() {
    var comboitems = [];
    // PAM should be able to go through the dataInfo dict more easily than this
    for (const d in dataTypeEnum) {
      if (isNaN(Number(d))) {
        comboitems.push(
          <Combobox.Option value={d} key={stupidConversion(d)}>
            {dataInfo[stupidConversion(d)].label}
          </Combobox.Option>
        )
      };
    };
    return comboitems;
  }; 

  const groceries = [
    'Apples',
    'Bananas',
    'Broccoli',
    'Carrots',
    'Chocolate',
    'Grapes',
  ];

  const options = groceries.map((item) => (
    <Combobox.Option value={item} key={item}>
      {item}
    </Combobox.Option>
  ));

  // Here is where you list the components and elements that you want rendered. 
  return (
    <div className="Home">
      <div className="title">
        <div style={{textAlign:"center", fontSize:60, fontWeight:"bold"}}>Avian Influenza</div>
        <div style={{textAlign:"center", fontSize:30, fontWeight:"bold"}}>{dataInfo[dataType].label} of the {speciesName}</div>
      </div>
      {/* Calls the custom timeline component with the current week onChange function as parameters */}
      <Timeline week={week} onChangeWeek={checkForImage} />
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
          onOptionSubmit={(data_indx) => {
            console.log("Yipppeee"+data_indx);
            var data_type = stupidConversion(data_indx)
            if (await checkDataType(data_type)) {
              setDataType(data_type);
            }
            typeCombo.closeDropdown();
          }}
        >
          <Combobox.Target>
            <InputBase
             className="dataType-button"
              component="button"
              type="button"
              pointer
              rightSection={<Combobox.Chevron />}
              onClick={() => typeCombo.toggleDropdown()}
              rightSectionPointerEvents="none"
            >
              {dataType || <Input.Placeholder>Pick value</Input.Placeholder>}
            </InputBase>
          </Combobox.Target>

          <Combobox.Dropdown>
            <Combobox.Options>{dataTypeOptions()}</Combobox.Options>
          </Combobox.Dropdown>
        </Combobox>        
        {/* The dropdown for the species type */}
        <Menu position="right-start" withArrow>
          <Menu.Target>
            <ActionIcon
              className="speciesType-button"
              variant="filled"
              aria-label="Data Type"
            >
              <IconFeather stroke={1.5}/>
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>{taxaOptions}</Menu.Dropdown>
        </Menu>
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
