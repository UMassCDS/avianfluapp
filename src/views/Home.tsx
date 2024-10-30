import { ActionIcon, Button, Combobox, ComboboxStore, Grid, Input, InputBase, useCombobox } from '@mantine/core';
import { CheckIcon, Radio, Stack, Tooltip } from '@mantine/core';
import { MapContainer, TileLayer, ImageOverlay } from 'react-leaflet';
import { forwardRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconInfoCircle } from '@tabler/icons-react';
import { imageURL, getScalingFilename, dataInfo} from '../hooks/dataUrl';
import taxa from '../assets/taxa.json';
import Timeline from '../components/Timeline';
import Legend from '../components/Legend';
import { isMobile } from '../utils/mobile';
import '../styles/Home.css';
import 'leaflet/dist/leaflet.css';

const MAX_WEEK = 52;  // number of weeks in a year
const WEEK_TO_MSEC = 7*24*60*60*1000;
// the lat/long bounds of the data image provided by the backend
const imageBounds = [
  [9.622994, -170.291626],
  [79.98956, -49.783429],
];
const buttonFontSize = 16;

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
  const speciesCombo = useCombobox();
  const navigate = useNavigate();
  const textSize = isMobile()?"xs":"md";
  const textEm:string|number = isMobile()?10:14;
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
    speciesCombo.selectedOptionIndex = s_index;
    setDataIndex(d_index);
    setSpeciesIndex(s_index);
  };

  // maps data types (abundance, movement etc) to radio buttons
  const dataTypeRadio = dataInfo.map((dt, index) => (
    <Radio icon={CheckIcon} checked={dataIndex===index} onChange={() => {
      checkInputTypes(index, speciesIndex)}
    } size={textSize} label={dt.label} />
  ));
  
  // creates component surrounding the data type widgets to add tool tip
  const DataTypeComponent = forwardRef<HTMLDivElement>((props, ref) => (
    <div ref={ref} {...props}>
      <Stack>
        {dataTypeRadio}
      </Stack>
    </div>
  ));

  function genericCombo(ref_combo: ComboboxStore, onSubmit: Function, label: string, options: JSX.Element[]) {
    return (
      <Combobox
        store={ref_combo}
        onOptionSubmit={(val) => {
          onSubmit(val, ref_combo); 
        }}
        size={textSize}
      >
        <Combobox.Target>
          <InputBase
            component="button"
            type="button"
            pointer
            leftSection={<Combobox.Chevron />}
            onClick={() => ref_combo.toggleDropdown()}
            leftSectionPointerEvents="none"
            size={textSize}
          >
            {label || <Input.Placeholder>Pick value</Input.Placeholder>}
          </InputBase>
        </Combobox.Target>
        <Combobox.Dropdown>
          <Combobox.Options>{options}</Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>      
    );
  }

  // Maps the species from the taxa file provided to a dropdown with options. 
  const speciesOptions = taxa.map((t, index) => (
    <Combobox.Option value={index.toString()} key={t.value} style={{fontSize:{textEm}}}>
      {t.label}
    </Combobox.Option>
  ));

  // checks the scaling file for the species and data type exists
  function checkSpecies(val: string, ref_combo: ComboboxStore) {
    let index = Number.parseInt(val); 
    checkInputTypes(dataIndex, index);
    ref_combo.closeDropdown();
  }

  // Species combo box
  const SpeciesComponent = forwardRef<HTMLDivElement>((props, ref) => (
    <div ref={ref} {...props}>
      {genericCombo(speciesCombo, checkSpecies, taxa[speciesIndex].label, speciesOptions)}
    </div>
  ));

  // species selection, type selection and about button
  const ControlBar = forwardRef<HTMLDivElement>((props, ref) => (
    <div ref={ref} {...props}>
      <Grid align='stretch'>
        <Grid.Col span={2}>
          {/* Dropdown for data type */}
          <Tooltip label='Types of data sets'>
            <DataTypeComponent />
          </Tooltip>
        </Grid.Col>
        <Grid.Col span={8}>
          <div style={{textAlign:"center", fontSize:60, fontWeight:"bold"}}>Avian Influenza</div>
        </Grid.Col>
        <Grid.Col span={1}>
        </Grid.Col>
        <Grid.Col span={1}>
          <Button leftSection={<IconInfoCircle/>} variant='default' >
            <Link style={{fontSize:buttonFontSize}} to="/about"> About </Link>
          </Button>
        </Grid.Col>
        { /* next row */ }
        <Grid.Col span={3}>
          {/* The dropdown for the species type */}
          <Tooltip label='These Species were chosen because'>
            <SpeciesComponent />
          </Tooltip>
        </Grid.Col>
        <Grid.Col span={6}>
          <div style={{textAlign:"center", fontSize:30, fontWeight:"bold"}}>{dataInfo[dataIndex].label} of the {taxa[speciesIndex].label}</div>
        </Grid.Col>
        <Grid.Col span={3}></Grid.Col>
      </Grid>
    </div>
  ));

  // same as ControlBar, but smaller
  const ControlBarMobile = forwardRef<HTMLDivElement>((props, ref) => (
    <div ref={ref} {...props} style={{fontSize:{textEm}}}>
      <Grid align='stretch'>
        <Grid.Col span={4}>
          {/* Dropdown for data type */}
          <Tooltip label='Types of data sets'>
            <DataTypeComponent />
          </Tooltip>
        </Grid.Col>
        <Grid.Col span={6}>
          {/* The dropdown for the species type */}
          <Tooltip label='These Species were chosen because'>
            <SpeciesComponent />
          </Tooltip>
        </Grid.Col>
        <Grid.Col span={2}>
          <ActionIcon onClick={() => { navigate("/about")}}>
            <IconInfoCircle/>
          </ActionIcon>
        </Grid.Col>
      </Grid>
    </div>
  ));

  // Here is where you list the components and elements that you want rendered. 
  return (
    <div className="Home">
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
        { /* Overlays an image that contains the data to be displayed on top of the map */}
        <ImageOverlay
          url={overlayUrl}
          bounds={imageBounds}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          opacity={0.7}
        />
      </MapContainer>
      <div className="widgets"> 
        {isMobile()?
          <ControlBarMobile /> : <ControlBar/>
        }
      </div>
      {/* Calls the custom legend component with the data type and species type as parameters. */}
      <Legend dataTypeIndex={dataIndex} speciesIndex={speciesIndex} />
      {/* Calls the custom timeline component with the current week onChange function as parameters */}
      <Timeline week={week} onChangeWeek={checkImageAndUpdate} />
    </div>
  );
}

export default Home;
