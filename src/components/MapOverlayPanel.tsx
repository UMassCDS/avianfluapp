import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { dataInfo } from "../hooks/dataUrl";
import AppHeader from "./AppHeader";

interface MapOverlayPanelProps {
  children?: React.ReactNode;
}

export default function MapOverlayPanel({ children }: MapOverlayPanelProps) {
  const dataIndex = useSelector((state: RootState) => state.species.dataIndex);

  return (
    <div className="bg-white/30 rounded-xl shadow-lg p-4 w-full">
      <AppHeader />
      <div className="text-base font-semibold text-blue-800 mb-2 text-center">
        {dataInfo[dataIndex]?.label}
      </div>
      {children}
    </div>
  );
}