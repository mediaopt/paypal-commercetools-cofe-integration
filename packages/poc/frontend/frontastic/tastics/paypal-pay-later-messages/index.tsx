import React from 'react';

import { PayPalMessages } from 'paypal-commercetools-client/dist/esm';

import { payPalMessagesParams } from '../../../components/commercetools-ui/checkout/checkout-form/payPalMessagesParams';
import { payPalCheckoutData } from '../../../components/commercetools-ui/checkout/checkout-form/payPalCheckoutData';
export default function PayPalPayLaterMessagesTastic({ data }) {
  const { requestHeader, params, options, purchaseCallback } = payPalCheckoutData();

  payPalMessagesParams['placement'] = data.placement;
  return (
    <PayPalMessages
      requestHeader={requestHeader}
      {...payPalMessagesParams}
      purchaseCallback={purchaseCallback}
      {...params}
      options={{ ...options, components: 'messages' }}
    />
  );
}
