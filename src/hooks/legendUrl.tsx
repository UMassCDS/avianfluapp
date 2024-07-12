// avianinfluenza.s3.us-east-2.amazonaws.com/abundance/mean/scale_abundance_mean.json
const baseUrl = 'https://avianinfluenza.s3.us-east-2.amazonaws.com/';
// eslint-disable-next-line import/prefer-default-export
export function changeLegend(dataType: string, speciesType: string): string {
  const finalUrl = `${
    baseUrl + dataType
  }/${speciesType}/scale_${dataType}_${speciesType}.json`;
  return finalUrl;
}
