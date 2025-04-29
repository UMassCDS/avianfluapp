import { Combobox, ComboboxStore, Grid, Input, InputBase, Select, Tooltip } from "@mantine/core";
import { dataInfo } from "../hooks/dataUrl";
import { forwardRef } from "react";

// creates component surrounding the data type widgets to add tool tip
interface DataTypeComponentProps {
  dataIndex: number;
  speciesIndex: number;
  checkInputTypes: (dataIndex: number, speciesIndex: number) => void;
}

function genericCombo(ref_combo: ComboboxStore, onSubmit: Function, label: string, textSize: string, options: JSX.Element[]) {  
  return (
    <Combobox
      store={ref_combo}
      onOptionSubmit={(val) => {
        onSubmit(val, ref_combo); 
      }}
      size={textSize}
    >
      <Combobox.Target>
        <InputBase
          component="button"
          type="button"
          pointer
          leftSection={<Combobox.Chevron />}
          onClick={() => ref_combo.toggleDropdown()}
          leftSectionPointerEvents="none"
          size={textSize}
          multiline={true}
        >
          {label || <Input.Placeholder>Pick value</Input.Placeholder>}
        </InputBase>
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>      
  );
}

const DataTypeComponent = forwardRef<HTMLDivElement, DataTypeComponentProps>((props, ref) => {
  const { dataIndex, speciesIndex, checkInputTypes } = props;
  const indexToData = ["abundance", "movement", "inflow", "outflow"];
  const dataToIndex = {
    "abundance": 0,
    "movement": 1,
    "inflow": 2,
    "outflow": 3
  };

  return (
    <div ref={ref}>
      <Select
        data={dataInfo.map((dt) => ({ value: dt.datatype, label: dt.label }))}
        value={indexToData[dataIndex]}
        onChange={(dataType) => {
          if (dataType !== null) {
            checkInputTypes(dataToIndex[dataType as keyof typeof dataToIndex], speciesIndex);
          } else {
            console.log("dataType is null (abundance, movement, inflow, outflow). This shouldn't be happening!");
          }
        }}
      />
    </div>
  );
});

// Species combo box
interface SpeciesComponentProps {
  speciesCombo: ComboboxStore;
  checkSpecies: (value: string, combo: ComboboxStore) => void;
  taxa: { label: string }[];
  textSize: string;
  speciesOptions: JSX.Element[];
  speciesIndex: number;
}

const SpeciesComponent = forwardRef<HTMLDivElement, SpeciesComponentProps>((props, ref) => {
  const { speciesCombo, checkSpecies, taxa, textSize, speciesOptions, speciesIndex, ...rest } = props;

  return (
    <div ref={ref} {...rest}>
      {genericCombo(speciesCombo, checkSpecies, taxa[speciesIndex].label, textSize, speciesOptions)}
    </div>
  );
});

interface ControlBarProps {
  dataIndex: number;
  speciesIndex: number;
  checkInputTypes: (dataIndex: number, speciesIndex: number) => void;
  titleSize: string | number;
  speciesCombo: ComboboxStore;
  checkSpecies: (value: string, combo: ComboboxStore) => void;
  taxa: { label: string }[];
  textSize: string;
  speciesOptions: JSX.Element[];
}

export default function ControlBar(props: ControlBarProps) {
  const { dataIndex, speciesIndex, checkInputTypes, titleSize, speciesCombo, checkSpecies, taxa, textSize, speciesOptions } = props;

  return (
    <div>
      <Grid justify='center' align='stretch'>
        { /* top row Title */ }
        <Grid.Col span={12}>
          <div style={{textAlign:"center", fontSize: titleSize, fontWeight:"bold"}}>Avian Influenza</div>
        </Grid.Col>
        { /* 2nd row */ }
        <Grid.Col span={{ base: 4, md: 2, lg: 2 }}>
          {/* Dropdown for data type */}
          <Tooltip label='Types of data sets'>
            <DataTypeComponent dataIndex={dataIndex} speciesIndex={speciesIndex} checkInputTypes={checkInputTypes} />
          </Tooltip>
        </Grid.Col>
        <Grid.Col span={{ base: 6, md: 4, lg: 3 }}>
          {/* The dropdown for the species type */}
          <Tooltip label='Wild bird species that potentially carry Avian Influenza'>
            <SpeciesComponent speciesCombo={speciesCombo} checkSpecies={checkSpecies} taxa={taxa} textSize={textSize} speciesOptions={speciesOptions} speciesIndex={speciesIndex} />
          </Tooltip>
        </Grid.Col>
      </Grid>
    </div>
  );
}