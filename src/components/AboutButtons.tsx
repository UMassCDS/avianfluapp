import { IconInfoCircle } from "@tabler/icons-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../store/store";
import { Tooltip } from '@mantine/core';

/**
 * Renders only the About button for the About section.
 */
export default function AboutButtons() {
  const navigate = useNavigate();
  const iconSize = useSelector((state: RootState) => state.ui.iconSize);

  return (
    <div className="flex flex-col gap-2">
      <Tooltip label="About page" position="left" withArrow>
        <button
          className="bg-white/90 hover:bg-blue-100 shadow-lg rounded-full p-2 border border-blue-200 transition"
          style={{ width: 48, height: 48 }}
          aria-label="About page"
          title="About page"
          onClick={() => navigate("/about")}
          type="button"
        >
          <IconInfoCircle size={iconSize || 28} className="text-blue-600 mx-auto" />
        </button>
      </Tooltip>
    </div>
  );
}