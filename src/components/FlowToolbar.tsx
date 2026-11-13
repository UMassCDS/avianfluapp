import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import taxa from '../assets/taxa.json';
import FlowDownloadButton from './FlowDownloadButton';
import FlowPrompt from './FlowPrompt';
import FlowSearchSlot from './FlowSearchSlot';
import InflowOutflowCalculateButton from './InflowOutflowCalculateButton';

/**
 * Inflow/outflow toolbar items: download, calculate (with its guide prompts) and location search.
 */
export default function FlowToolbar({
  location,
  startWeek,
  nFlowWeeks,
  isCalculating,
  startDateDragged,
  onCalculatingChange,
}: {
  location: string[];
  startWeek: number;
  nFlowWeeks: number;
  isCalculating: boolean;
  startDateDragged: boolean; // user dragged the start date
  onCalculatingChange: (calculating: boolean) => void;
}) {
  const dataIndex = useSelector((state: RootState) => state.species.dataIndex);
  const speciesIndex = useSelector((state: RootState) => state.species.speciesIndex);
  const flowResults = useSelector((state: RootState) => state.map.flowResults);
  const hasResults = Array.isArray(flowResults) && flowResults.length > 0;

  // placed a marker or opened the search
  const [locationPromptDone, setLocationPromptDone] = useState(false);
  useEffect(() => {
    if (location.length > 0) setLocationPromptDone(true);
  }, [location]);

  return (
    <>
      <FlowDownloadButton />
      <div className="relative">
        <FlowPrompt
          show={location.length === 0 && !locationPromptDone}
          title="Select a Location"
          message="Click anywhere in the highlighted area, or use the search button."
        />
        <FlowPrompt
          show={location.length > 0 && !startDateDragged && !isCalculating && !hasResults}
          title="Select a Start Date"
          message="Drag the timeline marker to change the start date, or calculate with the current selection."
        />
        <InflowOutflowCalculateButton
          dataIndex={dataIndex}
          startWeek={startWeek}
          speciesIndex={speciesIndex}
          location={location}
          nFlowWeeks={nFlowWeeks}
          onCalculatingChange={onCalculatingChange}
          speciesOptions={taxa}
          disabled={location.length === 0 || hasResults}
        />
      </div>
      <FlowSearchSlot onSearchButtonClick={() => setLocationPromptDone(true)} />
    </>
  );
}
