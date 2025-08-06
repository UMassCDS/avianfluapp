import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Combobox, ComboboxStore, useCombobox } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import L from 'leaflet';
import AboutButtons from '../components/AboutButtons';
import ControlBar from '../components/ControlBar';
import InflowOutflowCalculateButton from '../components/InflowOutflowCalculateButton';
import FlowDownloadButton from '../components/FlowDownloadButton';
import DataLegend from '../components/DataLegend';
import MapOverlayPanel from '../components/MapOverlayPanel';
import MapView from '../components/MapView';
import Timeline from '../components/Timeline/Timeline';
import { loadOutbreaks, OutbreakLegend } from '../components/OutbreakPoints';
import { imageURL, getScalingFilename, dataInfo } from '../hooks/dataUrl';
import { RootState } from '../store/store';
import { setDataIndex, setSpeciesIndex } from '../store/slices/speciesSlice';
import { setWeek } from '../store/slices/timelineSlice';
import {
  setFontHeight,
  setIconSize,
  setIsMonitor,
  setTextSize,
  setTitleSize,
} from '../store/slices/uiSlice';
import {
  setOverlayUrl,
  clearFlowResults,
  updateOverlayByWeek,
  clearOverlayUrl,
} from '../store/slices/mapSlice';

import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import '../styles/Home.css';
import taxa from '../assets/taxa.json';

// Fix for missing marker icon in production
// Import marker images
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for missing marker icon in production
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
//

const MIN_REG_WINDOW_WIDTH = 600;
const N_FLOW_WEEKS = 20; // can be made configurable later

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
  const flowResults = useSelector((state: RootState) => state.map.flowResults);

  // const [week, setWeek] = useState(MIN_WEEK);
  const week = useSelector((state: RootState) => state.timeline.week);

  // default state of the map overlay url for the current data displayed.
  const speciesCombo = useCombobox();
  const fontHeight = useSelector((state: RootState) => state.ui.fontHeight);

  const [location, setLocation] = useState<string[]>([]);
  const [useSearchMode, setUseSearchMode] = useState(false);
  const [startWeek, setStartWeek] = useState(week); // default to marker week

  // Callback passed to MapView
  const handleLocationSelect = (latLon: string | null) => {
    setLocation(latLon ? [latLon] : []); // For now, just one point; supports multiple later
    // If location is changed invalidate and stop displaying any prior results
    dispatch(clearFlowResults());
    dispatch(clearOverlayUrl());
  };

  const toggleMode = () => setUseSearchMode((prev) => !prev);

  function handleWindowSizeChange() {
    if (window.innerWidth <  MIN_REG_WINDOW_WIDTH) {
      // small window
      dispatch(setTextSize('xs'));
      dispatch(setFontHeight(10));
      dispatch(setIconSize(28));
      dispatch(setTitleSize(20));
      dispatch(setIsMonitor(false));
    } else {
      // reg window
      dispatch(setTextSize('md'));
      dispatch(setFontHeight(14));
      dispatch(setIconSize(28));
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

  // Prompt for location if in inflow/outflow and none selected
  useEffect(() => {
    if (dataIndex >= 2 && location.length === 0) {
      notifications.show({
        title: 'Select a Location',
        message: 'To begin inflow or outflow analysis, please select a location on the map or use the search button.',
        color: 'blue',
      });
    }
  }, [dataIndex, location.length]);

  async function checkImage(thisWeek: number): Promise<boolean> {
    // Skip check for inflow/outflow
    if (dataIndex >= 2) {
      return Promise.resolve(true);
    }

    const imageUrl = imageURL(dataIndex, speciesIndex, thisWeek);
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.debug(response);
      notifications.show({
        title: 'Missing Image',
        message: `The .png for week ${thisWeek} on ${dataInfo[dataIndex].label} of ${taxa[speciesIndex].label} is missing.`,
        color: 'orange',
      });

      return false;
    }
    dispatch(setOverlayUrl(imageUrl));
    return true;
  }

  async function onChangeWeek(thisWeek: number) {
    console.log(`onChangeWeek ${thisWeek}`)
    dispatch(setWeek(thisWeek));
    dispatch(updateOverlayByWeek(thisWeek));
    await checkImage(thisWeek);
  }

  useEffect(() => {
    dispatch(clearOverlayUrl());
    dispatch(clearFlowResults());
    checkImage(week);
  }, [dataIndex, speciesIndex]);

  async function checkInputTypes(d_index: number, s_index: number) {
    // Inflow/Outflow is handled separately via the InflowOutflowCalculateButton button component.
    if (d_index === 2 || d_index === 3) {
      speciesCombo.selectedOptionIndex = s_index;
      dispatch(setDataIndex(d_index));
      dispatch(setSpeciesIndex(s_index));
      return;
    }
    // END

    // Check if legend (scale) file exists
    if ((d_index !== dataIndex) || (s_index !== speciesIndex)) {
      const response = await fetch(getScalingFilename(d_index, s_index));
      if (!response.ok) {
        console.debug(response);
        notifications.show({
          title: 'Missing Scale File',
          message: `The scale file for ${dataInfo[d_index].label} of ${taxa[s_index].label} is missing.`,
          color: 'orange',
        });

        return;
      }
    }
    speciesCombo.selectedOptionIndex = s_index;
    dispatch(setDataIndex(d_index));
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

  // Shows the Legend component if:
	// - dataIndex < 2 (e.g., for abundance or movement), or
	// - flowResults is a non-empty array (e.g., for inflow or outflow when results exist).
  const shouldShowDataLegend = dataIndex < 2 || (Array.isArray(flowResults) && flowResults.length > 0);

// Here is where you list the components and elements that you want rendered. 
  return (
    <div className="Home">
      {/* Top center overlay panel */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[1100] max-w-lg w-[90vw]">
        <MapOverlayPanel
          location={location}
          startWeek={startWeek}
        >
          {dataIndex >= 2 && (
            <div className="flex flex-row items-center justify-center gap-4">
              {/* Switch to Search/Click Mode Button
              <Tooltip label="Select flow start location" position="top" withArrow offset={8}>
                <button
                  onClick={toggleMode}
                  type="button"
                  className={`flex items-center gap-2 p-1 rounded-xl border-2 transition font-semibold shadow-md
                    ${useSearchMode
                      ? 'bg-white border-blue-400 text-blue-500 hover:bg-blue-50 hover:border-blue-500 active:bg-blue-100'
                      : 'bg-white border-blue-400 text-blue-500 hover:bg-blue-50 hover:border-blue-500 active:bg-blue-100'
                    }
                    text-base sm:text-base`
                  }
                  style={{ marginTop: 'var(--mantine-spacing-md)' }}
                >
                  {useSearchMode ? (
                    <>
                      <IconClick size={20} className="text-blue-500 sm:w-5 sm:h-5 w-5 h-5" />
                      <span className="hidden sm:inline">Switch to Click Mode</span>
                    </>
                  ) : (
                    <>
                      <IconSearch size={16} className="text-blue-500 sm:w-4 sm:h-4 w-4 h-4" />
                      <span className="hidden sm:inline">Switch to Search Mode</span>
                    </>
                  )}
                </button>
              </Tooltip> */}
              {/* Inflow/Outflow Calculate Button */}
              <InflowOutflowCalculateButton
                dataIndex={dataIndex}
                week={week}
                speciesIndex={speciesIndex}
                location={location}
                nFlowWeeks={N_FLOW_WEEKS}
                speciesOptions={taxa}
                disabled={location.length === 0 || (Array.isArray(flowResults) && flowResults.length > 0)}
              />
              <FlowDownloadButton />
            </div>
          )}
        </MapOverlayPanel>
      </div>

      <div className="relative w-full h-[100vh]">
        <MapView
          week={week}
          dataIndex={dataIndex}
          onLocationSelect={handleLocationSelect}
          useSearchMode={useSearchMode}
        />
      </div>
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 items-end">
        <AboutButtons />
        <ControlBar
          checkInputTypes={checkInputTypes}
          speciesCombo={speciesCombo}
          checkSpecies={checkSpecies}
          speciesOptions={speciesOptions}
        />
      </div>

      {shouldShowDataLegend && <DataLegend />}
      <OutbreakLegend />

      <Timeline
        onChangeWeek={onChangeWeek}
        onChangeStartWeek={setStartWeek}
        nFlowWeeks={N_FLOW_WEEKS}
      />
    </div>
  );
}

export default HomePage;
