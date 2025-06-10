import { Combobox, ComboboxStore, useCombobox } from '@mantine/core';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { imageURL, getScalingFilename, dataInfo} from '../hooks/dataUrl';
import taxa from '../assets/taxa.json';
import Timeline from '../components/Timeline';
import Legend from '../components/Legend';
import {loadOutbreaks, OutbreakLegend} from '../components/OutbreakPoints'
import '../styles/Home.css';
// const express = require('express');
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import InflowOutflowTimeline from '../components/InflowOutflowTimeline';
import MapView from '../components/MapView';
import ControlBar from '../components/ControlBar';
import AboutButtons from '../components/AboutButtons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store'; // Adjust the path to your store file
import { setDataIndex, setSpeciesIndex } from '../store/slices/speciesSlice';
import { setWeek } from '../store/slices/timelineSlice';
import { setFontHeight, setIconSize, setIsMonitor, setTextSize, setTitleSize } from '../store/slices/uiSlice';
import { setOverlayUrl } from '../store/slices/mapSlice';

const MIN_REG_WINDOW_WIDTH = 600;

/**
 * HomePage component is the main view for the application, responsible for rendering the interactive map,
 * control widgets, and timeline sliders for visualizing avian flu data. It manages state related to species,
 * data type, week selection, and UI preferences using Redux selectors and dispatchers.
 *
 * Features:
 * - Loads outbreak data and adjusts UI based on window size.
 * - Handles species and data type selection, including validation of required resources.
 * - Dynamically updates map overlays and legends based on user input.
 * - Provides timeline controls for abundance, movement, inflow, and outflow datasets.
 * - Integrates with backend APIs for testing connectivity.
 *
 * @component
 * @returns {JSX.Element} The rendered HomePage component.
 */

/* Right now, HomePage() component is where most of the logic lives (for example, things like play/pause button to display data every week over the range provided by timeline slider) */
const HomePage = () => {  
  const dispatch = useDispatch();
  const speciesIndex = useSelector((state: RootState) => state.species.speciesIndex);
  const dataIndex = useSelector((state: RootState) => state.species.dataIndex);

  // const [week, setWeek] = useState(MIN_WEEK);
  const week = useSelector((state: RootState) => state.timeline.week);

  // default state of the map overlay url for the current data displayed.
  const overlayUrl = useSelector((state: RootState) => state.map.overlayUrl);
  const speciesCombo = useCombobox();

  const isMonitor = useSelector((state: RootState) => state.ui.isMonitor);
  const iconSize = useSelector((state: RootState) => state.ui.iconSize);
  const textSize = useSelector((state: RootState) => state.ui.textSize);
  const fontHeight = useSelector((state: RootState) => state.ui.fontHeight);
  const titleSize = useSelector((state: RootState) => state.ui.titleSize);

  const [location, setLocation] = useState<string[]>([]);

  // Callback passed to MapView
  const handleLocationSelect = (latLon: string | null) => {
    setLocation(latLon ? [latLon] : []); // For now, just one point; supports multiple later
  };

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
      dispatch(setTextSize('xs'));
      dispatch(setFontHeight(10));
      dispatch(setIconSize('xl'));
      dispatch(setTitleSize(20));
      dispatch(setIsMonitor(false));
    } else {
      // reg window
      dispatch(setTextSize('md'));
      dispatch(setFontHeight(14));
      dispatch(setIconSize('xl'));
      dispatch(setTitleSize(40));
      dispatch(setIsMonitor(true));
    }
  }

  // Called once on startup. Adds a listener for user keyboard events. 
  // Note: it appears this is not called when using Firefox on the iPhone PM 11/9/2024
  useEffect(() => {
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
      dispatch(setOverlayUrl(""));
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
    dispatch(setOverlayUrl(image_url));
    return true;
  }

  async function checkImageAndUpdate(this_week: number) {
    var response = await checkImage(this_week);
    if (response) {
      console.log("HOME: onChangeWeek: ",this_week);
      dispatch(setWeek(this_week));
    }
  }

  function flowUpdate(this_week: number) {
    console.log("flowUpdate: ",this_week);
    dispatch(setWeek(this_week));
  }

  useEffect(() => {
    console.log("dataIndex and species change", week);
    checkImage(week);
  }, [dataIndex, speciesIndex]);

  async function checkInputTypes(d_index: number, s_index: number) {
    // THIS CODE IS NEEDED BECAUSE BACKEND FOR INFLOW/OUTFLOW IS NOT READY
    if (d_index === 2 || d_index === 3) {
      speciesCombo.selectedOptionIndex = s_index;
      dispatch(setDataIndex(d_index));
      // setSpeciesIndex(s_index);
      dispatch(setSpeciesIndex(s_index));
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
    dispatch(setDataIndex(d_index));
    // setSpeciesIndex(s_index);
    dispatch(setSpeciesIndex(s_index));
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
      <MapView
        week={week}
        dataIndex={dataIndex}
        onLocationSelect={handleLocationSelect}
      />

      <div className="widgets"> 
        <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
            <OutbreakLegend/>
          </div>
          <ControlBar 
            checkInputTypes={checkInputTypes}
            speciesCombo={speciesCombo}
            checkSpecies={checkSpecies}
            speciesOptions={speciesOptions}
          />
        </div>
      </div>
      <AboutButtons runTest={runTest} />
      
      {/* If dataIndex >= 2, then it's currently inflow/outflow */}
      {dataIndex < 2 && (
          <Legend />
      )}

      {/* Show this slider for abundance and movement */}
      {dataIndex < 2 && <Timeline week={week} dataset={dataIndex} isMonitor={isMonitor} onChangeWeek={checkImageAndUpdate} />}

      {/* Show this slider for inflow and outflow */}
      {dataIndex >= 2 && <InflowOutflowTimeline onChangeWeek={flowUpdate} duration={25} />}
    </div>
  );
}

export default HomePage;
