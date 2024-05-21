const baseUrl = 'https://avianinfluenza.s3.us-east-2.amazonaws.com/';

// eslint-disable-next-line import/prefer-default-export
/* export function dataTypeChange(dataType: string, url: string): string {
  const finalUrl = `${
    baseUrl + dataType
  }/${speciesType}/${dataType}_${speciesType}_${week}.png`;
  return finalUrl;
} */

// eslint-disable-next-line import/prefer-default-export
export function speciesChange(
  dataType: string,
  speciesType: string,
  week: string
): string {
  const finalUrl = `${
    baseUrl + dataType
  }/${speciesType}/${dataType}_${speciesType}_${week}.png`;
  return finalUrl;
}

export function dataTypeChange(
  dataType: string,
  speciesType: string,
  week: string
): string {
  const finalUrl = `${
    baseUrl + dataType
  }/${speciesType}/${dataType}_${speciesType}_${week}.png`;
  return finalUrl;
}
