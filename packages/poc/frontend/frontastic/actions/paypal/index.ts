import useSWR from 'swr';
import { fetchApiHub, revalidateOptions } from 'frontastic';
import {
  GetPayPalSettingsResponse,
  UpdateOrderOnShippingChangeResponse,
  captureOrderResponse,
} from '../../provider/frontastic/UsePayPal';

export const getSettings = async () => {
  const result = await useSWR<GetPayPalSettingsResponse>(
    '/action/settings/getPayPalSettings',
    fetchApiHub,
    revalidateOptions,
  );
  return result.data;
};

export const updateOrderOnShippingChange = async (): Promise<UpdateOrderOnShippingChangeResponse> => {
  const res = await fetchApiHub(
    '/action/payment/updateOrderOnShippingChange',
    {
      headers: {
        accept: 'application/json',
      },
      credentials: 'include',
      method: 'POST',
    },
    {},
  );
  return res;
};

export const captureOrder = async (
  paymentId: string,
  paymentVersion: number,
  orderID?: string,
): Promise<captureOrderResponse> => {
  const res = await fetchApiHub(
    '/action/payment/capturePayPalOrder',
    {
      headers: {
        accept: 'application/json',
      },
      credentials: 'include',
      method: 'POST',
    },
    { paymentId, paymentVersion, orderID },
  );
  return res;
};
