import { ActionIcon, Tooltip } from "@mantine/core";
import { IconInfoCircle, IconTestPipe, IconWriting } from "@tabler/icons-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../store/store";

interface AboutButtonsProps {
  runTest: () => void;
}

export default function AboutButtions({runTest }: AboutButtonsProps) {
  const navigate = useNavigate();

  const iconSize = useSelector((state: RootState) => state.ui.iconSize);
  
  return (
    <div className="about">
      <Tooltip label='Test RestAPI'>
          <ActionIcon style={{margin:12}} size={iconSize} onClick={() => { runTest()}}>
            <IconTestPipe/>
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