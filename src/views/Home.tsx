import { ActionIcon, Combobox, ComboboxStore, Grid, Input, InputBase, useCombobox } from '@mantine/core';
import { CheckIcon, MantineSize, Radio, Stack, Tooltip } from '@mantine/core';
import { MapContainer, TileLayer, ImageOverlay } from 'react-leaflet';
import { forwardRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconInfoCircle, IconWriting } from '@tabler/icons-react';
import { imageURL, getScalingFilename, dataInfo} from '../hooks/dataUrl';
import taxa from '../assets/taxa.json';
import Timeline from '../components/Timeline';
import Legend from '../components/Legend';
import {OutbreakMarkers, loadOutbreaks, OutbreakLegend} from '../components/OutbreakPoints'
import {dateToWeek, MIN_WEEK, MAX_WEEK} from '../utils/utils'
import '../styles/Home.css';
import 'leaflet/dist/leaflet.css';


const MIN_REG_WINDOW_WIDTH = 600;
// the lat/long bounds of the data image provided by the backend
const imageBounds = [
  [9.622994, -170.291626],
  [79.98956, -49.783429],
];

/* This is the main page and only page of the application. 
   Here, the map renders as well as all the AvianFluApp feature controls */
const HomePage = () => {  
  // Sets the default position for the map.
  const position = {
    lat: 45,
    lng: -95,
  };
  // Initialize data type - so far this is abundance or netmovement
  const [dataIndex, setDataIndex] = useState(0);
  // Sets state for the species type 
  const [speciesIndex, setSpeciesIndex] = useState(0);
  const [week, setWeek] = useState(MIN_WEEK);
  const [adjustWeek, setAdjustWeek] = useState(0);
  // default state of the map overlay url for the current data displayed.
  const [overlayUrl, setOverlayUrl] = useState("");
  const speciesCombo = useCombobox();
  // useNavigate is used to switch pages
  const navigate = useNavigate();
  const [iconSize, setIconSize] = useState<MantineSize>('xl');
  const [textSize, setTextSize] = useState<MantineSize>('md');
  const [fontHeight, setFontHeight] = useState<number>(14);
  const [titleSize, setTitleSize] = useState<number>(40);
  const [isMonitor, setIsMonitor] = useState<boolean>(true);


  function handleWindowSizeChange() {
    if (window.innerWidth <  MIN_REG_WINDOW_WIDTH) {
      // small window
      setTextSize('xs');
      setFontHeight(10);
      setIconSize('xl');
      setTitleSize(20);
      setIsMonitor(false);
    } else {
      // reg window
      setTextSize('md');
      setFontHeight(14);
      setIconSize('xl');
      setTitleSize(40);
      setIsMonitor(true);
    }
  }

  /* Allows the user to use the front and back arrow keys to control the week number 
     and which image files are being displayed. It is set with the values at the time 
     of addListener and does not get updated state variables. */ 
  const handleSelection = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setAdjustWeek(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setAdjustWeek(-1);
    }
  }

  useEffect(() => {
    if (adjustWeek === 0) {
      return;
    }
    if (adjustWeek > 0) {
      // increments active index (wraps around when at end of year)
      let temp = week + 1;
      if (temp > MAX_WEEK) temp = MIN_WEEK;
      checkImageAndUpdate(temp);
    } else {
      // decrements active index (wraps around when at beginning of year)
      let temp = week - 1;
      if (temp < MIN_WEEK) temp = MAX_WEEK;
      checkImageAndUpdate(temp);
    }
    setAdjustWeek(0);
  }, [adjustWeek]);

  // Called once on startup. Adds a listener for user keyboard events. 
  // Note: it appears this is not called when using Firefox on the iPhone PM 11/9/2024
  useEffect(() => {
    loadOutbreaks();
    // determine current week 
    checkImageAndUpdate(dateToWeek(new Date()));
    handleWindowSizeChange();
    document.addEventListener('keydown', handleSelection);
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      document.removeEventListener('keydown', handleSelection);
      window.removeEventListener('resize', handleWindowSizeChange);
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
    <Radio 
      icon={CheckIcon} 
      key={dt.label}
      checked={dataIndex===index} 
      onChange={() => {
        checkInputTypes(index, speciesIndex)}
      } 
      size={textSize}
      label={dt.label} 
    />
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
            multiline={true}
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
    <Combobox.Option value={index.toString()} key={t.value} style={{fontSize:fontHeight}}>
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
  const ControlBar = () => (
    <div>
      <Grid justify='center' align='stretch'>
        { /* top row Title */ }
        <Grid.Col span={12}>
          <div style={{textAlign:"center", fontSize:titleSize, fontWeight:"bold"}}>Avian Influenza</div>
        </Grid.Col>
        { /* 2nd row */ }
        <Grid.Col span={{ base: 4, md: 2, lg: 2 }}>
          {/* Dropdown for data type */}
          <Tooltip label='Types of data sets'>
            <DataTypeComponent />
          </Tooltip>
        </Grid.Col>
        <Grid.Col span={{ base: 6, md: 4, lg: 3 }}>
          {/* The dropdown for the species type */}
          <Tooltip label='Wild bird species that potentially carry Avian Influenza'>
            <SpeciesComponent />
          </Tooltip>
        </Grid.Col>
      </Grid>
    </div>
  );


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
        {OutbreakMarkers(week)}
      </MapContainer>
      <div className="widgets"> 
        <ControlBar/>
        <OutbreakLegend/>
      </div>
      <div className="about"> 
        <Tooltip label='Leave feedback and suggestions.'>
            <ActionIcon style={{margin:12}} size={iconSize} onClick={() => { navigate("/feedback")}}>
              <IconWriting/>
            </ActionIcon>
        </Tooltip>
        <Tooltip label='About page'>
            <ActionIcon size={iconSize} onClick={() => { navigate("/about")}}>
              <IconInfoCircle/>
            </ActionIcon>
        </Tooltip>
      </div>
      {/* Calls the custom legend component with the data type and species type as parameters. */}
      <Legend dataTypeIndex={dataIndex} speciesIndex={speciesIndex} />
      {/* Calls the custom timeline component with the current week onChange function as parameters */}
      <Timeline week={week} dataset={dataIndex} isMonitor={isMonitor} onChangeWeek={checkImageAndUpdate} />
    </div>
  );
}

export default HomePage;
