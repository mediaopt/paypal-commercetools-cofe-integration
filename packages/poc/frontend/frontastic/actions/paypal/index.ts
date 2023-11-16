import useSWR from 'swr';
import { fetchApiHub, revalidateOptions } from 'frontastic';
import { UsePayPalSettings } from '../../provider/frontastic/UsePayPalSettings';

export const getPayPalSettings = () => {
  const result = useSWR<UsePayPalSettings>('/action/settings/getPayPalSettings', fetchApiHub, revalidateOptions);
  return result.data as UsePayPalSettings;
};
