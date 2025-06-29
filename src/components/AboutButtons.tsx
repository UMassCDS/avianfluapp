import { ActionIcon, Tooltip } from "@mantine/core";
import { IconInfoCircle, IconTestPipe, IconWriting } from "@tabler/icons-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../store/store";

interface AboutButtonsProps {
  runTest: () => void;
}

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
export default function AboutButtions({runTest }: AboutButtonsProps) {
  const navigate = useNavigate();

  const iconSize = useSelector((state: RootState) => state.ui.iconSize);
  
  return (
    <div className="about">
      <Tooltip label='Test RestAPI'>
          <ActionIcon
            style={{ margin: 12 }}
            size={iconSize}
            onClick={() => { window.open("https://www.birdfluapi.com/__docs__/", "_blank"); }}
          >
            <IconTestPipe />
          </ActionIcon>
      </Tooltip> 
      <Tooltip label='Leave feedback and suggestions.'>
          <ActionIcon style={{margin:12}} size={iconSize} onClick={() => { navigate("/feedback")}}>
            <IconWriting/>
          </ActionIcon>
      </Tooltip>
      <Tooltip label='About page'>
          <ActionIcon size={iconSize} onClick={() => { navigate("/about")}}>
            <IconInfoCircle/>
          </ActionIcon>
      </Tooltip>
    </div>
  );
}