import { useMemo } from 'react';
import { CartInformation } from 'paypal-commercetools-client/dist/esm/src/types';

export const useCheckoutData = (
  data: { [x: string]: string; emailAddress?: any; emailAdddress?: any; invoiceId?: any },
  billingSameAsShipping: boolean,
  billingInformation: {
    firstName: string;
    lastName: string;
    streetName: string;
    streetNumber: string;
    city: string;
    country: string;
    postalCode: string;
  },
  shippingInformation: {
    firstName: string;
    lastName: string;
    streetName: string;
    streetNumber: string;
    city: string;
    country: string;
    postalCode: string;
  },
  submitText: string,
  submitForm: () => void,
) => {
  const cartInformation: CartInformation = useMemo(() => {
    return {
      account: { email: data.emailAddress },
      billing: billingInformation,
      shipping: billingSameAsShipping ? billingInformation : shippingInformation,
    };
  }, [data.emailAdddress, billingInformation, shippingInformation]);

  const invoiceValue = useMemo(() => {
    return data.invoiceId ?? '';
  }, [data.invoiceId]);

  const invoiceData = useMemo(() => {
    return {
      invoiceValue: invoiceValue,
      text: submitText,
      clickAction: submitForm,
    };
  }, [submitText, submitForm, invoiceValue]);
  return { cartInformation, invoiceData };
};
