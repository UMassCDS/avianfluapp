import { dataInfo } from "../hooks/dataUrl";
import taxa from '../assets/taxa.json';
import AppHeader from "./AppHeader";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

interface MapOverlayPanelProps {
  children?: React.ReactNode;
}

export default function MapOverlayPanel({ children }: MapOverlayPanelProps) {
  const dataIndex = useSelector((state: RootState) => state.species.dataIndex);
  const speciesIndex = useSelector((state: RootState) => state.species.speciesIndex);

  return (
    <div className="bg-white/30 rounded-xl shadow-lg p-4 w-full">
      <AppHeader />
      <div className="text-sm text-blue-500 mb-2 text-center">
        <span><strong>Data:</strong> {dataInfo[dataIndex]?.label}</span>
        <span> &nbsp;|&nbsp; </span>
        <span><strong>Species:</strong> {taxa[speciesIndex].label}</span>
      </div>
      {children}
    </div>
  );
}