
const baseUrl = 'https://avianinfluenza.s3.us-east-2.amazonaws.com/';
import taxa from '../assets/taxa.json';

export var dataInfo: {
  datatype: string,
  label: string,
  units: string
 } [] = [
  {
    datatype:'abundance', 
    label:'Abundance',
    units: 'Birds/km^2',
  },
  {
    datatype: 'movement', 
    label:'Movement',
    units: 'Birds/km/week',
  },
];


/* Determine the url containing data to display the legend scale.
 The function takes in the data type index and the species type. */
export function getScalingFilename(data_index: number, taxa_index: number): string {
  const name = dataInfo[data_index].datatype;
  const finalUrl = `${
    baseUrl + name
  }/${taxa[taxa_index].value}/scale_${name}_${taxa[taxa_index].value}.json`;
  return finalUrl;
}

/* Determine the url containing the image data. 
   The function takes in the data type index, the species type, and the week number. */
export function imageURL(
  data_index: number,
  taxa_index: number,
  week: number,
): string {
  const name = dataInfo[data_index].datatype;
  const finalUrl = `${
    baseUrl + name
  }/${taxa[taxa_index].value}/${name}_${taxa[taxa_index].value}_${week}.png`;
  return finalUrl;
}
