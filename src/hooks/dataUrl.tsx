
const baseUrl = 'https://avianinfluenza.s3.us-east-2.amazonaws.com/';
// use constant keys to help w/ typos.  The values match file naming convention.
export enum dataTypeEnum {
  ABUNDANCE, MOVEMENT
}

export function stupidConversion(input: string): dataTypeEnum {
  if (input === "ABUNDANCE") {
    return dataTypeEnum.ABUNDANCE;
  }
  if (input === "MOVEMENT") {
    return dataTypeEnum.MOVEMENT;
  }
  return dataTypeEnum.ABUNDANCE;
  // PAM create error
}

type dataObj = {
  filename: string,
  label: string,
  units: string
 };

export type dataInterface = {
  [key in dataTypeEnum]: dataObj;
};

export var dataInfo:{[key in dataTypeEnum]: dataObj;} = {
  [dataTypeEnum.ABUNDANCE] : {
    filename:'abundance', 
    label:'Abundance',
    units: 'Birds/km^2',
  },
  [dataTypeEnum.MOVEMENT] : {
    filename: 'netmovement', 
    label:'Migration',
    units: 'Birds/km/week',
  },
};


/* Determine the url containing data to display the legend scale.
 The function takes in the data type and the species type. */
export function changeLegend(dataType: dataTypeEnum, speciesType: string): string {
  let name = dataInfo[dataType].filename;
  const finalUrl = `${
    baseUrl + name
  }/${speciesType}/scale_${name}_${speciesType}.json`;
  return finalUrl;
}

/* Determine the url containing the image data. 
   The function takes in the data type, the species type, and the week number. */
export function imageURL(
  dataType: dataTypeEnum,
  speciesType: string,
  week: number,
): string {
  let name = dataInfo[dataType].filename;
  const finalUrl = `${
    baseUrl + name
  }/${speciesType}/${name}_${speciesType}_${week}.png`;
  return finalUrl;
}
