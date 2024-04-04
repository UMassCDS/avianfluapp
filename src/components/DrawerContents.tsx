/* eslint-disable react/destructuring-assignment */
import { Select, Button, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import taxa from '../assets/taxa.json';

function DrawerContents(props: any) {
  const dataTypeInputs = ['Abundance', 'Net Movement', 'Influx', 'Outflux'];

  const form = useForm({});

  /* set data default to abundance 
    species to mean 
    date to current date 

    drawer->header or permanently open drawer
  */
  return (
    <div className="MenuContents">
      <form onSubmit={form.onSubmit((values) => props.onSubmit(values))}>
        <Select
          label="Data Type"
          placeholder="Pick value"
          data={dataTypeInputs}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...form.getInputProps('dataType')}
        />
        <Select
          label="Species"
          placeholder="Pick value"
          data={taxa}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...form.getInputProps('speciesType')}
        />
        <DateInput
          label="Date"
          placeholder="Pick value"
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...form.getInputProps('date')}
        />
        <Group mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </form>
    </div>
  );
}

export default DrawerContents;
