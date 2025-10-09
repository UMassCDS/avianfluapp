import { dataInfo } from "../hooks/dataUrl";
import taxa from '../assets/taxa.json';
import AppHeader from "./AppHeader";
import ab_dates from '../assets/abundance_dates.json';
import mv_dates from '../assets/movement_dates.json';
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

const datasets = [ab_dates, mv_dates, ab_dates, ab_dates];

interface MapOverlayPanelProps {
  children?: React.ReactNode;
  location: string[];
  startWeek: number;
}

export default function MapOverlayPanel({ children, location, startWeek }: MapOverlayPanelProps) {
  const dataIndex = useSelector((state: RootState) => state.species.dataIndex);
  const speciesIndex = useSelector((state: RootState) => state.species.speciesIndex);
  const flowResults = useSelector((state: RootState) => state.map.flowResults);

  // Use startWeek for Start Date
  const dateLabel = datasets[dataIndex][startWeek]?.label || datasets[dataIndex][startWeek]?.date || '';
  // Get start location (like tooltip)
  let locationLabel = '-';
  if (location && location.length > 0 && location[0]) {
    const [lat, lon] = location[0].split(',').map(Number);
    const latStr = `${lat.toFixed(1)} N`;
    const lonStr = `${Math.abs(lon).toFixed(1)} W`;
    locationLabel = `${latStr}, ${lonStr}`;
  }
  // Results displayed?
  const resultsDisplayed = Array.isArray(flowResults) && flowResults.length > 0 ? 'Results displayed' : 'No results';
  const mode = dataInfo[dataIndex]?.datatype; // 'inflow', 'outflow', 'abundance', 'movement'

  return (
    <div className="bg-white/30 rounded-xl shadow-lg p-4 w-full">
      <AppHeader />
      <div className="text-sm text-blue-500 mb-2 text-center">
        <span><strong>Data:</strong> {dataInfo[dataIndex]?.label}</span>
        <span> &nbsp;|&nbsp; </span>
        <span><strong>Species:</strong> {taxa[speciesIndex].label}</span>
      </div>
      {(mode === 'inflow' || mode === 'outflow') && (
        <div className="text-xs text-gray-700 mb-2 text-center">
          {dateLabel && <span>Start Date: {dateLabel}</span>}
          <span> &nbsp;|&nbsp; Start Location: {locationLabel}</span>
          <span> &nbsp;|&nbsp; {resultsDisplayed}</span>
        </div>
      )}
      {children}
    </div>
  );
}