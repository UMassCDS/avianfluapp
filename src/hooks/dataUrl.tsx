
const baseUrl = 'https://avianinfluenza.s3.us-east-2.amazonaws.com/';
export enum DataTypes {ABUNDANCE = 'abundance', MOVEMENT = 'netmovement'};

/* Determine the url containing data to display the legend scale.
 The function takes in the data type and the species type. */
export function changeLegend(dataType: DataTypes, speciesType: string): string {
  const finalUrl = `${
    baseUrl + dataType
  }/${speciesType}/scale_${dataType}_${speciesType}.json`;
  return finalUrl;
}

/* Determine the url containing the image data. 
   The function takes in the data type, the species type, and the week number. */
export function imageURL(
  dataType: DataTypes,
  speciesType: string,
  week: number,
): string {
  const finalUrl = `${
    baseUrl + dataType
  }/${speciesType}/${dataType}_${speciesType}_${week}.png`;
  return finalUrl;
}
