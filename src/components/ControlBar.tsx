import { useRef, useEffect, useState } from "react";
import { IconStack2 } from "@tabler/icons-react";
import taxa from "../assets/taxa.json";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { dataInfo } from "../hooks/dataUrl";

type ControlBarProps = {
  checkInputTypes: (dataTypeIdx: number, speciesIdx: number) => void;
  speciesCombo: any; // Replace 'any' with the actual type if known
  checkSpecies: (speciesIdx: string, speciesCombo: any) => void; // Replace 'any' if possible
  speciesOptions: any; // Replace 'any' with the actual type if known
};

export default function ControlBar({ checkInputTypes, speciesCombo, checkSpecies, speciesOptions }: ControlBarProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Redux state for selected indices
  const selectedDataType = useSelector((state: RootState) => state.species.dataIndex);
  const selectedSpecies = useSelector((state: RootState) => state.species.speciesIndex);

  // Data for dropdowns
  const dataTypes = dataInfo.map((dt, idx) => ({ value: idx, label: dt.label }));

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Handlers
  function handleDataTypeSelect(idx: number) {
    checkInputTypes(idx, selectedSpecies);
    setOpen(false);
  }
  function handleSpeciesSelect(idx: number) {
    checkSpecies(String(idx), speciesCombo);
    setOpen(false);
  }

  return (
    <div
      className="flex flex-col items-end"
      ref={dropdownRef}
      style={{ pointerEvents: "auto" }}
    >
      <button
        className="bg-gradient-to-br from-blue-100 to-blue-300 hover:from-blue-200 hover:to-blue-400 shadow-xl rounded-xl border-2 border-blue-400 transition-all duration-200 flex items-center justify-center p-0"
        style={{ width: 54, height: 54 }}
        onClick={() => setOpen((v) => !v)}
        aria-label="Show controls"
        type="button"
      >
        <span className="flex items-center justify-center w-full h-full">
          <IconStack2 size={32} className="text-blue-700" />
        </span>
      </button>
      {open && (
        <div className="mt-3 w-64 rounded-2xl bg-white/95 shadow-2xl border-2 border-blue-200 p-5 flex flex-col gap-6 animate-fade-in">
          {/* Data Type Dropdown */}
          <div>
            <div className="mb-2 text-xs text-blue-700 font-bold uppercase tracking-wide">Data Type</div>
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
          {/* Species Dropdown */}
          <div>
            <div className="mb-2 text-xs text-blue-700 font-bold uppercase tracking-wide">Species</div>
            <div className="flex flex-col gap-1 max-h-44 overflow-y-auto">
              {taxa.map((t, idx) => (
                <button
                  key={t.label}
                  className={`w-full text-left px-4 py-2 rounded-lg transition font-medium ${
                    selectedSpecies === idx
                      ? "bg-blue-100 text-blue-800 ring-2 ring-blue-300"
                      : "hover:bg-blue-50 text-blue-700"
                  }`}
                  onClick={() => handleSpeciesSelect(idx)}
                  type="button"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
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