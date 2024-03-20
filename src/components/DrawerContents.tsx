import { Select, Button, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
/* import dayjs from 'dayjs';
import { DateInput } from '@mantine/dates'; */
import taxa from '../assets/taxa.json';

function DrawerContents() {
  const dataTypeInputs = ['Abundance', 'Net Movement', 'Influx', 'Outflux'];

  const form = useForm({});

  return (
    <div className="MenuContents">
      <form onSubmit={form.onSubmit((values) => console.log(values))}>
        {/* <Tooltip label="Tooltip">
          <ActionIcon variant="filled" aria-label="Settings" />
        </Tooltip> */}
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
          {...form.getInputProps('dataType')}
        />
        {/* 
        <DateInput
          minDate={new Date()}
          maxDate={dayjs(new Date()).add(1, 'month').toDate()}
          label="Date input"
          placeholder="Date input"
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...form.getInputProps('date')}
        /> */}
        <Group mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </form>
    </div>
  );
}

export default DrawerContents;
