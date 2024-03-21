import moment from 'moment';

interface AbundanceProps {
  dataType: string;
  speciesType: string;
  date: Date;
}

// eslint-disable-next-line import/prefer-default-export
export function abundanceUrl(props: Record<string, unknown>): string {
  const baseUrl = 'https://avianinfluenza.s3.us-east-2.amazonaws.com/';
  const dataType = 'abundance';
  const abd2 = 'abundance2';
  let week = '1';
  if (props.date) {
    week = moment(props.date).format('W');
    console.log(week);
  }

  const finalUrl = `${baseUrl + abd2}/${props.speciesType}/${dataType}_${
    props.speciesType
  }_${week}`;

  console.log('the final url is', finalUrl);
  return finalUrl;
}
