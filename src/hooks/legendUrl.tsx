// avianinfluenza.s3.us-east-2.amazonaws.com/abundance/mean/scale_abundance_mean.json
const baseUrl = 'https://avianinfluenza.s3.us-east-2.amazonaws.com/';
/* This is a custom hook for changing the url which is used to display the legend scale. The function takes in the data type and the species type based on on user input in the main page. */
// eslint-disable-next-line import/prefer-default-export
export function changeLegend(dataType: string, speciesType: string): string {
  const finalUrl = `${
    baseUrl + dataType
  }/${speciesType}/scale_${dataType}_${speciesType}.json`;
  return finalUrl;
}
