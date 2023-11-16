export type CountryOption = {
  display: string;
  data: string;
};

export const countryOptions: CountryOption[] = [
  { display: 'Albania', data: 'AL' },
  { display: 'Austria', data: 'AT' },
  { display: 'Australia', data: 'AU' },
  { display: 'Belarus', data: 'BY' },
  { display: 'Bulgaria', data: 'BG' },
  { display: 'Canada', data: 'CA' },
  { display: 'Belgium', data: 'BE' },
  { display: 'Switzerland', data: 'CH' },
  { display: 'Cyprus', data: 'CY' },
  { display: 'Czech Republic', data: 'CZ' },
  { display: 'Germany', data: 'DE' },
  { display: 'Denmark', data: 'DK' },
  { display: 'Estonia', data: 'EE' },
  { display: 'Egypt', data: 'EG' },
  { display: 'Spain', data: 'ES' },
  { display: 'Finland', data: 'FI' },
  { display: 'France', data: 'FR' },
  { display: 'United Kingdom', data: 'GB' },
  { display: 'Greece', data: 'GR' },
  { display: 'Croatia', data: 'HR' },
  { display: 'Hungary', data: 'HU' },
  { display: 'Iceland', data: 'IS' },
  { display: 'Ireland', data: 'IE' },
  { display: 'Lithuania', data: 'LT' },
  { display: 'Luxembourg', data: 'LU' },
  { display: 'Latvia', data: 'LV' },
  { display: 'Malta', data: 'MT' },
  { display: 'Moldova', data: 'ML' },
  { display: 'United States', data: 'US' },
  { display: 'Netherlands', data: 'NL' },
  { display: 'Norway', data: 'NO' },
  { display: 'Poland', data: 'PL' },
  { display: 'Portugal', data: 'PT' },
  { display: 'Romania', data: 'RO' },
  { display: 'Serbia and Montenegro', data: 'CS' },
  { display: 'Sweden', data: 'SE' },
  { display: 'Singapore', data: 'SG' },
  { display: 'Ukraine', data: 'UA' },
  { display: 'Italy', data: 'IT' },
];

export const getCountryOptions = (countryData: string[]) => {
  return countryData
    .map((data) => countryOptions.filter((country) => country.data.toLowerCase() === data.toLowerCase()))
    .filter((countryArray) => countryArray.length === 1)
    .map((countryArray) => countryArray[0]);
};

export const getCountryName = (countryCode: string) => {
  const lowercaseCode = countryCode.toLowerCase();
  const countryData = countryOptions.filter((country) => country.data.toLowerCase() === lowercaseCode);
  return countryData[0].display ?? '';
};
