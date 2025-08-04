import { useRef, useEffect, useState } from "react";
import { IconStack2 } from "@tabler/icons-react";
import taxa from "../assets/taxa.json";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { dataInfo } from "../hooks/dataUrl";
import { toggleOutbreaks } from "../store/slices/mapSlice";
import { Tooltip } from "@mantine/core";

type ControlBarProps = {
  checkInputTypes: (dataTypeIdx: number, speciesIdx: number) => void;
  speciesCombo: any;
  checkSpecies: (speciesIdx: string, speciesCombo: any) => void;
  speciesOptions: any;
};

export default function ControlBar({
  checkInputTypes,
  speciesCombo,
  checkSpecies,
  speciesOptions,
}: ControlBarProps) {
  const [openDataType, setOpenDataType] = useState(false);
  const [openSpecies, setOpenSpecies] = useState(false);
  const dataTypeRef = useRef<HTMLDivElement>(null);
  const speciesRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  const selectedDataType = useSelector((state: RootState) => state.species.dataIndex);
  const selectedSpecies = useSelector((state: RootState) => state.species.speciesIndex);
  const showOutbreaks = useSelector((state: RootState) => state.map.showOutbreaks);
  const dataTypes = dataInfo.map((dt, idx) => ({ value: idx, label: dt.label }));

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (openDataType && dataTypeRef.current && !dataTypeRef.current.contains(e.target as Node)) {
        setOpenDataType(false);
      }
      if (openSpecies && speciesRef.current && !speciesRef.current.contains(e.target as Node)) {
        setOpenSpecies(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openDataType, openSpecies]);

  function handleDataTypeSelect(idx: number) {
    checkInputTypes(idx, selectedSpecies);
    setOpenDataType(false); 
  }
  function handleSpeciesSelect(idx: number) {
    checkSpecies(String(idx), speciesCombo);
    setOpenSpecies(false); 
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {/* Data Type Dropdown */}
      <div ref={dataTypeRef} className="relative">
        <Tooltip label="Control what data is displayed" position="left" withArrow>
          <button
            className="bg-gradient-to-br from-blue-100 to-blue-300 hover:from-blue-200 hover:to-blue-400 shadow-xl rounded-xl border-2 border-blue-400 transition-all duration-200 flex items-center justify-center p-0"
            style={{ width: 54, height: 54 }}
            onClick={() => setOpenDataType((v) => !v)}
            aria-label="Show data type controls"
            type="button"
          >
            <span className="flex items-center justify-center w-full h-full">
              <IconStack2 size={32} className="text-blue-700" />
            </span>
          </button>
        </Tooltip>
        {openDataType && (
          <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-white/95 shadow-2xl border-2 border-blue-200 p-5 flex flex-col gap-4 animate-fade-in z-50">
            {/* Outbreaks Section */}
            <div>
              <div className="mb-2 text-xs text-blue-700 font-bold uppercase tracking-wide">Outbreaks</div>
              <div className="flex items-center justify-between bg-blue-50/50 p-2 rounded-lg">
                <label htmlFor="outbreak-toggle" className="font-medium text-blue-800 text-sm">
                  Show HPAI Outbreaks
                </label>
                <button
                  id="outbreak-toggle"
                  onClick={() => dispatch(toggleOutbreaks())}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                    showOutbreaks ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                      showOutbreaks ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Data Type Section */}
            <div>
              <div className="mb-2 text-xs text-blue-700 font-bold uppercase tracking-wide">Data</div>
              <div className="flex flex-col gap-1">
                {dataTypes.map((dt, idx) => (
                  <button
                    key={dt.value}
                    className={`w-full text-left px-4 py-2 rounded-lg transition font-medium ${
                      selectedDataType === idx
                        ? "bg-blue-100 text-blue-800 ring-2 ring-blue-300"
                        : "hover:bg-blue-50 text-blue-700"
                    }`}
                    onClick={() => handleDataTypeSelect(idx)}
                    type="button"
                  >
                    {dt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Species Dropdown */}
      <div ref={speciesRef} className="relative">
        <Tooltip label='Select species to display or "Total" for all.' position="left" withArrow>
          <button
            className="bg-gradient-to-br from-blue-100 to-blue-300 hover:from-blue-200 hover:to-blue-400 shadow-xl rounded-xl border-2 border-blue-400 transition-all duration-200 flex items-center justify-center p-0"
            style={{ width: 54, height: 54 }}
            onClick={() => setOpenSpecies((v) => !v)}
            aria-label="Show species controls"
            type="button"
          >
            <span className="flex items-center justify-center w-full h-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgb(29 78 216)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="inline-block"
              >
                <path d="M16 7h.01"></path>
                <path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20"></path>
                <path d="m20 7 2 .5-2 .5"></path>
                <path d="M10 18v3"></path>
                <path d="M14 17.75V21"></path>
                <path d="M7 18a6 6 0 0 0 3.84-10.61"></path>
              </svg>
            </span>
          </button>
        </Tooltip>
        {openSpecies && (
          <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-white/95 shadow-2xl border-2 border-blue-200 p-5 flex flex-col gap-2 animate-fade-in z-50">
            <div className="mb-2 text-xs text-blue-500 font-bold uppercase tracking-wide flex items-center gap-1">
              Species
            </div>
            <div className="flex flex-col gap-1 max-h-44 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50 pr-1">
              {taxa.map((t, idx) => (
                <button
                  key={t.label}
                  className={`w-full text-left px-4 py-2 rounded-lg transition font-medium ${
                    selectedSpecies === idx
                      ? "bg-blue-100 text-blue-500 ring-2 ring-blue-300"
                      : "hover:bg-blue-50 text-blue-500"
                  }`}
                  onClick={() => handleSpeciesSelect(idx)}
                  type="button"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <style>
        {`
          .animate-fade-in {
            animation: fadeIn 0.18s cubic-bezier(.4,0,.2,1);
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px);}
            to { opacity: 1; transform: translateY(0);}
          }
        `}
      </style>
    </div>
  );
}