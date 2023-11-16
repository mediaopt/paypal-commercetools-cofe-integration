import { getCountryName } from '../../../../../helpers/countryOptions';

const dataGroup = (data: string[][]) => {
  return (
    <>
      {data.map((dataRow, index) => (
        <p key={index}>{dataRow.map((dataEntry) => `${dataEntry} `)}</p>
      ))}
    </>
  );
};

export const addressDataGroup = (address: {
  firstName?: string;
  lastName?: string;
  streetName?: string;
  streetNumber?: string;
  postalCode?: string;
  city?: string;
  country?: string;
}) => [
  [address.firstName, address.lastName],
  [address.streetName, address.streetNumber],
  [address.postalCode, address.city],
  [getCountryName(address.country)],
];

export const formDataGroup = (message: string, data: string[][]) => {
  return (
    <>
      {message && <label className="text-base font-medium text-gray-900 dark:text-light-100">{message}</label>}
      {dataGroup(data)}
    </>
  );
};
