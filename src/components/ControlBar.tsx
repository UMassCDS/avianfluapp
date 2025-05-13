import { Combobox, ComboboxStore, Grid, Input, InputBase, Select, Tooltip } from "@mantine/core";
import { dataInfo } from "../hooks/dataUrl";
import { forwardRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import taxa from "../assets/taxa.json";

/* This is Pam's component. She uses builtin components from Mantine Core to implement the dropdown used for Species dropdown menu */
function genericCombo(ref_combo: ComboboxStore, onSubmit: Function, label: string, options: JSX.Element[]) {
  const textSize = useSelector((state: RootState) => state.ui.textSize);

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

// creates component surrounding the data type widgets to add tool tip
interface DataTypeComponentProps {
  checkInputTypes: (dataIndex: number, speciesIndex: number) => void;
}

/**
 * `DataTypeComponent` is a React forwardRef component that renders a selectable dropdown
 * for choosing a data type (e.g., "abundance", "movement", "inflow", "outflow").
 * It uses Redux selectors to obtain the current species and data indices from the application state.
 * When a new data type is selected, it invokes the `checkInputTypes` callback with the
 * corresponding data type index and the current species index.
 *
 * @param props - The props for the component.
 * @param props.checkInputTypes - A callback function that is called when the data type changes,
 *   receiving the new data type index and the current species index.
 * @param ref - A React ref forwarded to the root div element.
 *
 * @returns A React element containing a dropdown for selecting the data type.
 */

/* Also Pam's component. I think forwardRef is used to pass control over DataTypeComponent to its child, but I'm not sure how Pam is using it yet. */
const DataTypeComponent = forwardRef<HTMLDivElement, DataTypeComponentProps>((props, ref) => {
  const { checkInputTypes } = props;
  const speciesIndex = useSelector((state: RootState) => state.species.speciesIndex);
  const dataIndex = useSelector((state: RootState) => state.species.dataIndex);
  
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
  speciesOptions: JSX.Element[];
}

/**
 * A React forwardRef component that renders a species selection combo box.
 *
 * @param props - The props for the SpeciesComponent.
 * @param props.speciesCombo - The current value or state for the species combo box.
 * @param props.checkSpecies - Callback function to handle species selection changes.
 * @param props.speciesOptions - Array of available species options for selection.
 * @param rest - Additional props passed to the root div element.
 * @param ref - Ref forwarded to the root div element.
 *
 * @returns A div containing the species dropdown menu, utilizing the `genericCombo` component.
 *
 * @remarks
 * Uses Redux's `useSelector` to access the current species index from the store.
 * The combo box is rendered using the `genericCombo` function, with the label determined by the selected species.
 */
const SpeciesComponent = forwardRef<HTMLDivElement, SpeciesComponentProps>((props, ref) => {
  const { speciesCombo, checkSpecies, speciesOptions, ...rest } = props;

  const speciesIndex = useSelector((state: RootState) => state.species.speciesIndex);

  return (
    <div ref={ref} {...rest}>
      {genericCombo(speciesCombo, checkSpecies, taxa[speciesIndex].label, speciesOptions)}
    </div>
  );
});

interface ControlBarProps {
  checkInputTypes: (dataIndex: number, speciesIndex: number) => void;
  speciesCombo: ComboboxStore;
  checkSpecies: (value: string, combo: ComboboxStore) => void;
  speciesOptions: JSX.Element[];
}

export default function ControlBar(props: ControlBarProps) {
  const {checkInputTypes, speciesCombo, checkSpecies, speciesOptions } = props;

  const titleSize = useSelector((state: RootState) => state.ui.titleSize);

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
            <DataTypeComponent checkInputTypes={checkInputTypes} />
          </Tooltip>
        </Grid.Col>
        <Grid.Col span={{ base: 6, md: 4, lg: 3 }}>
          {/* The dropdown for the species type */}
          <Tooltip label='Wild bird species that potentially carry Avian Influenza'>
            <SpeciesComponent speciesCombo={speciesCombo} checkSpecies={checkSpecies} speciesOptions={speciesOptions} />
          </Tooltip>
        </Grid.Col>
      </Grid>
    </div>
  );
}