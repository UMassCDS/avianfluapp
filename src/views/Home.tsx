import { ActionIcon, Combobox, ComboboxStore, Grid, Input, InputBase, useCombobox } from '@mantine/core';
import { CheckIcon, MantineSize, Radio, Stack, Tooltip, Select } from '@mantine/core';
import { MapContainer, TileLayer, ImageOverlay, useMap } from 'react-leaflet';
import { forwardRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconInfoCircle, IconTestPipe, IconWriting } from '@tabler/icons-react';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { imageURL, getScalingFilename, dataInfo} from '../hooks/dataUrl';
import taxa from '../assets/taxa.json';
import Timeline from '../components/Timeline';
import Legend from '../components/Legend';
import {OutbreakMarkers, loadOutbreaks, OutbreakLegend} from '../components/OutbreakPoints'
import {MIN_WEEK} from '../utils/utils'
import '../styles/Home.css';
// const express = require('express');
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import InflowOutflowTimeline from '../components/InflowOutflowTimeline';
import MapView from '../components/MapView';
import ControlBar from '../components/ControlBar';
import About from './About';
import AboutButtons from '../components/AboutButtons';


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
  // default state of the map overlay url for the current data displayed.
  const [overlayUrl, setOverlayUrl] = useState("");
  const speciesCombo = useCombobox();
  const [iconSize, setIconSize] = useState<MantineSize>('xl');
  const [textSize, setTextSize] = useState<MantineSize>('md');
  const [fontHeight, setFontHeight] = useState<number>(14);
  const [titleSize, setTitleSize] = useState<number>(40);
  const [isMonitor, setIsMonitor] = useState<boolean>(true);

  const showSearch = dataIndex >= 2;

  function runTest() {
    console.log("Pam's test code");
    axios.get('http://localhost:8000/echo', {params: {text: "Tiggy Rules"}})
      .then(function (response) {
        // handle success
        console.log(response.data);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .finally(function () {
        // always executed
      }
    );
  }
  
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

  // Called once on startup. Adds a listener for user keyboard events. 
  // Note: it appears this is not called when using Firefox on the iPhone PM 11/9/2024
  useEffect(() => {
    // THIS PART IS FOR TESTING IF REACT APPLICATION CAN ACCESS THE R BACKEND
    // const testRApi = async () => {
    //   try {
        // const response = await axios.get(`http://localhost:8000/${functionName}?loc=${loc}&week=${week}&taxa=${taxa}&n={n_f_low_weeks}`);
    //     console.log(response.data);
    //   } catch (error) {
    //     console.error("Error fetching data:", error);
    //   }
    // };
    // testRApi();
    // TESTING ENDS HERE

    loadOutbreaks();
    handleWindowSizeChange();
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, []);

  async function checkImage(this_week: number): Promise<boolean>{
    // Does nothing when it's inflow/outflow
    if (dataIndex >= 2) {
      setOverlayUrl("");
      return Promise.resolve(true);
    }

    var image_url = imageURL(dataIndex, speciesIndex, this_week);
    var response = await fetch(image_url);
    if (!response.ok) {
      console.debug(response);
      var message = "The .png for week "+this_week+" on "+dataInfo[dataIndex].label+" of "+taxa[speciesIndex].label+" is missing.";
      alert(message);
      return false;
    }
    setOverlayUrl(image_url);
    return true;
  }

  async function checkImageAndUpdate(this_week: number) {
    var response = await checkImage(this_week);
    if (response) {
      console.log("HOME: onChangeWeek: ",this_week);
      setWeek(this_week);
    }
  }

  function flowUpdate(this_week: number) {
    console.log("flowUpdate: ",this_week);
    setWeek(this_week);
  }

  useEffect(() => {
    console.log("dataIndex and species change", week);
    checkImage(week);
  }, [dataIndex, speciesIndex]);

  async function checkInputTypes(d_index: number, s_index: number) {
    // THIS CODE IS NEEDED BECAUSE BACKEND FOR INFLOW/OUTFLOW IS NOT READY
    if (d_index === 2 || d_index === 3) {
      speciesCombo.selectedOptionIndex = s_index;
      setDataIndex(d_index);
      setSpeciesIndex(s_index);
      return;
    }
    // END

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

  // Here is where you list the components and elements that you want rendered. 
  return (
    <div className="Home">
      {/* Creates a map using the leaflet component */}
      <MapView overlayUrl={overlayUrl} week={week} />
      <div className="widgets"> 
        <ControlBar 
          dataIndex={dataIndex}
          speciesIndex={speciesIndex}
          checkInputTypes={checkInputTypes}
          titleSize={titleSize}
          speciesCombo={speciesCombo}
          checkSpecies={checkSpecies}
          taxa={taxa}
          textSize={textSize}
          speciesOptions={speciesOptions}
        />
        <OutbreakLegend/>
      </div>
      <AboutButtons iconSize={iconSize} runTest={runTest} />
      
      {/* If dataIndex >= 2, then it's currently inflow/outflow */}
      {dataIndex < 2 && (
          <Legend dataTypeIndex={dataIndex} speciesIndex={speciesIndex} />
      )}

      {/* Show this slider for abundance and movement */}
      {dataIndex < 2 && <Timeline week={week} dataset={dataIndex} isMonitor={isMonitor} onChangeWeek={checkImageAndUpdate} />}

      {/* Show this slider for inflow and outflow */}
      {dataIndex >= 2 && <InflowOutflowTimeline week={week} dataset={dataIndex} isMonitor={isMonitor} onChangeWeek={flowUpdate} duration={25} />}
    </div>
  );
}

export default HomePage;
