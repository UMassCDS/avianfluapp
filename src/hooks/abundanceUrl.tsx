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
  let week = '1';
  if (props.date) {
    week = moment(props.date).format('W');
  }

  const finalUrl = `${baseUrl + dataType}/${props.speciesType}/${dataType}_${
    props.speciesType
  }_${week}.png`;
  return finalUrl;
}
