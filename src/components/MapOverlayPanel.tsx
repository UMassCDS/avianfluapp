import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { dataInfo } from "../hooks/dataUrl";
import taxa from '../assets/taxa.json';
import AppHeader from "./AppHeader";

interface MapOverlayPanelProps {
  children?: React.ReactNode;
}

export default function MapOverlayPanel({ children }: MapOverlayPanelProps) {
  const dataIndex = useSelector((state: RootState) => state.species.dataIndex);
  const speciesIndex = useSelector((state: RootState) => state.species.speciesIndex);

  return (
    <div className="bg-white/30 rounded-xl shadow-lg p-4 w-full">
      <AppHeader />
      <div className="text-sm text-blue-800 mb-2 text-center">
        <strong>Data type:</strong> {dataInfo[dataIndex]?.label}
        <br/>
        <strong>Species:</strong> {taxa[speciesIndex].label}
      </div>
      {children}
    </div>
  );
}