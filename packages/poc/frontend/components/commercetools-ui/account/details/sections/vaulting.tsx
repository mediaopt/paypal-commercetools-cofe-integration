import React, { useCallback, useState } from 'react';
import { payPalCheckoutData } from '../../../checkout/checkout-form/payPalCheckoutData';
import { PaymentTokens, PayPal, CardFields } from 'paypal-commercetools-client/dist/esm';
import { useAccount } from 'frontastic';

const BACK_BUTTON_STYLES = 'mt-5 border-t-2 border-t-gray-100 pt-3';

const Vaulting = () => {
  const { loggedIn } = useAccount();
  const [paymentTokensMode, setPaymentTokensMode] = useState<boolean>(true);
  const [addPaymentTokenType, setAddPaymentTokenType] = useState<'paypal' | 'card'>();

  const vaultPurchaseCallback = useCallback((result) => {
    setPaymentTokensMode(true);
    setAddPaymentTokenType(undefined);
  }, []);

  if (!loggedIn) {
    return <div>Must be logged in to view vaulting</div>;
  }

  const { requestHeader, params, options, purchaseCallback, baseUrl, vaultOnlyParams } = payPalCheckoutData(
    undefined,
    undefined,
    undefined,
    false,
    loggedIn,
  );

  const PaymentTokensJson = {
    ...params,
    removePaymentTokenUrl: `${baseUrl}payment/removePaymentToken`,
    requestHeader,
    options,
  };

  return (
    <>
      {paymentTokensMode ? (
        <>
          <PaymentTokens {...PaymentTokensJson} purchaseCallback={purchaseCallback} />
          <div className="mt-3">
            <button onClick={() => setPaymentTokensMode(false)}>+ Add New Payment Method</button>
          </div>
        </>
      ) : (
        <>
          {addPaymentTokenType ? (
            <>
              {addPaymentTokenType === 'paypal' ? (
                <PayPal
                  {...vaultOnlyParams}
                  requestHeader={requestHeader}
                  options={options}
                  fundingSource="paypal"
                  purchaseCallback={vaultPurchaseCallback}
                />
              ) : (
                <CardFields
                  {...vaultOnlyParams}
                  requestHeader={requestHeader}
                  options={{
                    ...options,
                    components: 'card-fields,buttons',
                    vault: true,
                  }}
                  fundingSource="paypal"
                  purchaseCallback={vaultPurchaseCallback}
                />
              )}

              <p className="mt-5 text-sm">
                Sometimes it takes some minutes to see the vaulted account, after vaulting the account you need to
                refresh the page.
              </p>

              <div className={BACK_BUTTON_STYLES}>
                <button onClick={() => setAddPaymentTokenType(undefined)}>Back</button>
              </div>
            </>
          ) : (
            <>
              <div>
                <button onClick={() => setAddPaymentTokenType('paypal')}>- Add PayPal</button>
              </div>
              <div className="mt-3">
                <button onClick={() => setAddPaymentTokenType('card')}>- Add Credit/Debit Card</button>
              </div>
              <div className={BACK_BUTTON_STYLES}>
                <button onClick={() => setPaymentTokensMode(true)}>Back</button>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

export default Vaulting;
