const baseUrl = 'https://avianinfluenza.s3.us-east-2.amazonaws.com/';

/* This is a custom hook for changing the url which is used to dispay image data. The function takes in the data type, the species type, and the week number based on user input in the main page. */

// eslint-disable-next-line import/prefer-default-export
export function changeURL(
  dataType: string,
  speciesType: string,
  week: string
): string {
  const finalUrl = `${
    baseUrl + dataType
  }/${speciesType}/${dataType}_${speciesType}_${week}.png`;
  return finalUrl;
}
