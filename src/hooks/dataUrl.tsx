
const baseUrl = 'https://avianinfluenza.s3.us-east-2.amazonaws.com/';
// use constant keys to help w/ typos.  The values match file naming convention.
export enum DataTypes {ABUNDANCE, MOVEMENT}
interface dataNameObj {
  [key: string]: {
    [key: string]: string;
  };
}

export const DataInfo:dataNameObj = {
  ABUNDANCE:{
    filename:'abundance', 
    label:'Abundance',
    units: 'Birds/km^2',
  }, 
  MOVEMENT: {
    filename: 'netmovement', 
    label:'Migration',
    units: 'Birds/km/week',
  }
}

/* Determine the url containing data to display the legend scale.
 The function takes in the data type and the species type. */
export function changeLegend(dataType: DataTypes, speciesType: string): string {
  let name = DataInfo[dataType].filename;
  const finalUrl = `${
    baseUrl + name
  }/${speciesType}/scale_${name}_${speciesType}.json`;
  return finalUrl;
}

/* Determine the url containing the image data. 
   The function takes in the data type, the species type, and the week number. */
export function imageURL(
  dataType: DataTypes,
  speciesType: string,
  week: number,
): string {
  let name = DataInfo[dataType].filename;
  const finalUrl = `${
    baseUrl + name
  }/${speciesType}/${name}_${speciesType}_${week}.png`;
  return finalUrl;
}
