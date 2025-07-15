import { IconInfoCircle, IconTestPipe, IconWriting } from "@tabler/icons-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../store/store";
import { Tooltip } from '@mantine/core';

/**
 * Renders a set of action buttons for the About section, including:
 * - A button to run a test REST API call.
 * - A button to navigate to the feedback page.
 * - A button to navigate to the about page.
 *
 * @param runTest - Callback function to execute when the test button is clicked.
 *
 * The component uses Redux to determine the icon size and React Router for navigation.
 */
export default function AboutButtons() {
  const navigate = useNavigate();
  const iconSize = useSelector((state: RootState) => state.ui.iconSize);

  return (
    <div className="flex flex-col gap-2">
      <Tooltip label="Test RestAPI" position="left" withArrow>
        <button
          className="bg-white/90 hover:bg-blue-100 shadow-lg rounded-full p-2 border border-blue-200 transition"
          style={{ width: 48, height: 48 }}
          aria-label="Test RestAPI"
          title="Test RestAPI"
          onClick={() => window.open("https://www.birdfluapi.com/__docs__/", "_blank")}
          type="button"
        >
          <IconTestPipe size={iconSize || 28} className="text-blue-600 mx-auto" />
        </button>
      </Tooltip>
      <Tooltip label="Leave feedback and suggestions" position="left" withArrow>
        <button
          className="bg-white/90 hover:bg-blue-100 shadow-lg rounded-full p-2 border border-blue-200 transition"
          style={{ width: 48, height: 48 }}
          aria-label="Leave feedback and suggestions"
          title="Leave feedback and suggestions"
          onClick={() => navigate("/feedback")}
          type="button"
        >
          <IconWriting size={iconSize || 28} className="text-blue-600 mx-auto" />
        </button>
      </Tooltip>
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