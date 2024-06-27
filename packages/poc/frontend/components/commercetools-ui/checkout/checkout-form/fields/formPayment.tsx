import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useAccount } from 'frontastic';

import { PayPal, PayUponInvoice, CardFields, ApplePay, GooglePay } from 'paypal-commercetools-client/dist/esm';

import { useFormat } from '../../../../../helpers/hooks/useFormat';
import { useCart } from '../../../../../frontastic';
import { usePayPal } from '../../../../../frontastic';

import FormRadioGroup from './formRadioGroup';

import { payPalCheckoutData } from '../payPalCheckoutData';
import { payPalMessagesParams } from '../payPalMessagesParams';
import { filteredMethods } from '../payPalBasedPaymentMethods';

import { LineItem } from '@Types/cart/LineItem';
import { Order } from '@Types/cart/Order';
import { AvailablePaymentMethods, PaymentMethodsType } from '../../../../../types';

const centToMonetaryUnitPrice = (centPrice: string) => {
  if (centPrice.length < 3) centPrice = `000${centPrice}`;
  return (
    centPrice.substring(0, centPrice.length - 2) + '.' + centPrice.substring(centPrice.length - 2, centPrice.length)
  );
};

const formatLineItem = (item: LineItem) => {
  const totalPrice = item.totalPrice.centAmount.toString();
  const unitPrice = item.price.centAmount.toString();

  return {
    name: item.name,
    kind: 'debit',
    unitOfMeasure: 'unit',
    taxAmount: '0.00',
    discountAmount: '0.00',
    quantity: item.count.toString(),
    unitAmount: centToMonetaryUnitPrice(unitPrice),
    totalAmount: centToMonetaryUnitPrice(totalPrice),
    productCode: item.productId.substring(0, 8),
    commodityCode: '',
  };
};

const calculateDemoPrice = (cartData: Order) => {
  const demoItemsPrice = cartData?.sum?.centAmount ?? 0;
  const demoShippingPrice = cartData?.availableShippingMethods?.length
    ? cartData?.availableShippingMethods[0]?.rates[0]?.price?.centAmount
    : 0;
  return (demoItemsPrice + demoShippingPrice) / 100;
};

export const PaymentMethods = ({ updateFormInput, cartInformation }) => {
  const { checkout } = useCart();
  const { getSettings } = usePayPal();
  const { loggedIn } = useAccount();
  const [acceptPayLater, setAcceptPayLater] = useState(false);
  const [acceptCredit, setAcceptCredit] = useState(false);

  getSettings().then((settings) => {
    if (settings) {
      const { acceptPayLater, acceptCredit } = settings;
      setAcceptPayLater(acceptPayLater);
      setAcceptCredit(acceptCredit);
    }
  });

  const router = useRouter();
  const { formatMessage: formatCheckoutMessage } = useFormat({ name: 'checkout' });

  const cartData = useCart().data;
  const demoPrice = calculateDemoPrice(cartData);

  const lineItems = [];
  cartData?.lineItems?.forEach((item) => {
    lineItems.push(formatLineItem(item));
  });

  const { requestHeader, params, options, purchaseCallback, paypalInvoiceParams } = payPalCheckoutData(
    cartInformation,
    checkout,
    router,
    false,
    loggedIn,
  );

  const invoiceCallback = payPalCheckoutData(
    cartInformation,
    checkout,
    router,
    false,
    loggedIn,
    'thank-you-order-placed',
  ).purchaseCallback;

  const methodIdBasedFields = (methodId: string) => {
    return {
      id: `${methodId}Radiobutton`,
      label: formatCheckoutMessage({ id: methodId, defaultMessage: methodId }),
      value: methodId,
      isDefault: false,
    };
  };
  const payPalBasedMethod = (method: AvailablePaymentMethods) => {
    const { key: methodId, countries, additionalOptions } = method;

    const specificParams = methodId === 'paypal' ? { paypalMessages: payPalMessagesParams('payment', demoPrice) } : {};

    return {
      ...methodIdBasedFields(methodId),
      countries,
      component: (
        <div className="col-span-full">
          <PayPal
            purchaseCallback={purchaseCallback}
            {...params}
            requestHeader={requestHeader}
            options={{ ...options, ...additionalOptions }}
            fundingSource={methodId !== 'paypal' ? methodId : undefined}
            {...specificParams}
          />
        </div>
      ),
    };
  };

  const paymentMethods = useMemo(() => {
    if (acceptCredit === undefined && acceptPayLater === undefined) return;

    const initialMethods: PaymentMethodsType = filteredMethods(acceptPayLater).map(payPalBasedMethod);

    if (acceptCredit) {
      initialMethods.push({
        ...methodIdBasedFields('cardFields'),
        component: (
          <div className="mopt-card-fields col-span-full">
            <CardFields
              purchaseCallback={purchaseCallback}
              requestHeader={requestHeader}
              {...params}
              options={{
                ...options,
                components: 'card-fields,buttons',
                vault: false,
              }}
            />
          </div>
        ),
      });
    }
    initialMethods.push({
      ...methodIdBasedFields('PayPalInvoice'),
      label: 'Pay Upon Invoice',
      component: (
        <PayUponInvoice
          options={options}
          requestHeader={requestHeader}
          {...params}
          purchaseCallback={invoiceCallback}
          {...paypalInvoiceParams}
        />
      ),
    });

    if ('ApplePaySession' in window) {
      initialMethods.push({
        ...methodIdBasedFields('applepay'),
        component: (
          <div className="mopt-card-fields col-span-full">
            <ApplePay
              purchaseCallback={purchaseCallback}
              requestHeader={requestHeader}
              {...params}
              options={{
                ...options,
                components: 'applepay',
                buyerCountry: 'US',
              }}
              applePayDisplayName="My Store"
              enableVaulting={true}
            />
          </div>
        ),
      });
    }

    initialMethods.push({
      ...methodIdBasedFields('googlePay'),
      component: (
        <div className="mopt-card-fields col-span-full">
          <GooglePay
            allowedCardNetworks={['MASTERCARD', 'VISA']}
            allowedCardAuthMethods={['PAN_ONLY']}
            callbackIntents={['PAYMENT_AUTHORIZATION']}
            verificationMethod={'SCA_ALWAYS'}
            purchaseCallback={purchaseCallback}
            requestHeader={requestHeader}
            {...params}
            options={{
              ...options,
              components: 'googlepay',
            }}
          />
        </div>
      ),
    });

    return initialMethods;
  }, [cartInformation, acceptCredit, acceptPayLater]);

  const billingCountryCode = cartInformation.shipping.country.toUpperCase();

  const countryOptions = useMemo(() => {
    if (!paymentMethods) return;
    return paymentMethods.filter(({ countries }) => !countries || countries.includes(billingCountryCode));
  }, [paymentMethods, billingCountryCode]);

  const [activePaymentMethod, setActivePaymentMethod] = useState(undefined);

  useEffect(() => {
    updateFormInput('pay', activePaymentMethod);
  }, [activePaymentMethod]);

  return countryOptions ? (
    <FormRadioGroup
      headline={formatCheckoutMessage({ id: 'payment', defaultMessage: 'Payment' })}
      subline={formatCheckoutMessage({
        id: 'askPaymentPreference',
        defaultMessage: 'What do you prefer to pay with?',
      })}
      options={countryOptions}
      className="z-10 col-span-full pt-6"
      onChange={setActivePaymentMethod}
      activePaymentMethod={activePaymentMethod}
    />
  ) : (
    <></>
  );
};
