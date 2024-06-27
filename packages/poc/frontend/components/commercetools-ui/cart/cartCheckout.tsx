'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAccount } from 'frontastic';

import { PayPal } from 'paypal-commercetools-client/dist/esm';

import { useCart, usePayPal } from '../../../frontastic';
import { CartDetails } from 'frontastic/actions/cart';

import { payPalCheckoutData } from '../checkout/checkout-form/payPalCheckoutData';
import { payPalMessagesParams } from '../checkout/checkout-form/payPalMessagesParams';

import { PayPalButtonsComponentOptions } from '@paypal/paypal-js';

interface Props {
  handleAddToCart?: () => void;
  showPayPalDirectly?: boolean;
  isProductPage?: boolean;
}

type PayPalStyle = PayPalButtonsComponentOptions['style'];

const buttonsStyle = (isProductPage = false): PayPalStyle => {
  const defaultStyle: PayPalStyle = { label: 'buynow', color: 'gold' };
  if (isProductPage) return { ...defaultStyle, shape: 'pill', layout: 'horizontal' };
  else return { ...defaultStyle, shape: 'rect', layout: 'vertical' };
};

const CartCheckout = ({ handleAddToCart, showPayPalDirectly = false, isProductPage = false }: Props) => {
  const [showPayPal, setShowPayPal] = useState(showPayPalDirectly);
  const { loggedIn } = useAccount();
  const [shippingOptions, setShippingOptions] = useState([]);
  const [acceptPayLater, setAcceptPayLater] = useState(false);
  const { getSettings, updateOrderOnShippingChange, captureOrder } = usePayPal();

  const router = useRouter();
  const { checkout, removeItem, updateCart, getShippingMethods, setShippingMethod } = useCart();

  useEffect(() => {
    setShowPayPal(showPayPalDirectly);
  }, [showPayPalDirectly]);

  getSettings().then((value) => {
    setAcceptPayLater(value?.acceptPayLater);
  });

  const cartData = useCart().data;
  const demoItemsPrice = cartData?.sum?.centAmount ?? 0;
  const demoShippingPrice = cartData?.availableShippingMethods?.length
    ? cartData?.availableShippingMethods[0]?.rates[0]?.price?.centAmount
    : 0;
  const demoPrice = (demoItemsPrice + demoShippingPrice) / 100;

  const isCartCheckout = true;

  useEffect(() => {
    const shippingOptions = [];
    getShippingMethods().then((data) => {
      data.forEach(({ shippingMethodId, rates }) => {
        rates.forEach((rate) => {
          rate.locations.forEach((location) => {
            shippingOptions.push({
              shippingRateId: rate.shippingRateId,
              countryCode: location.country,
              shippingMethodId: shippingMethodId,
            });
          });
        });
      });
      setShippingOptions(shippingOptions);
    });
  }, []);

  const manageCart = async () => {
    if (handleAddToCart) {
      await Promise.all(cartData.lineItems.map(async (lineItem) => await removeItem(lineItem.lineItemId)));
      await handleAddToCart();
    }
    setShowPayPal(true);
  };

  const { requestHeader, params, options, purchaseCallback } = payPalCheckoutData(
    undefined,
    checkout,
    router,
    isCartCheckout,
    loggedIn,
  );

  return (
    <main>
      {showPayPal ? (
        <PayPal
          purchaseCallback={purchaseCallback}
          {...params}
          requestHeader={requestHeader}
          options={{
            ...options,
            commit: false,
            enableFunding: acceptPayLater ? 'paylater' : '',
            disableFunding: ['sepa', 'card'],
            components: 'messages,buttons',
          }}
          style={buttonsStyle(isProductPage)}
          onShippingChange={async ({ shipping_address }, actions) => {
            const { city, country_code: countryCode, postal_code: postalCode } = shipping_address;

            const shippingOption = shippingOptions.find((shippingOption) => shippingOption.countryCode === countryCode);
            if (!shippingOption) {
              return actions.reject();
            }

            const addressData = {
              city,
              country: countryCode,
              postalCode,
            };
            const updateCartPayload: CartDetails = {
              billing: { ...addressData },
              shipping: { ...addressData },
            };
            await updateCart(updateCartPayload);
            await setShippingMethod(shippingOption.shippingMethodId);
            await updateOrderOnShippingChange();

            return actions.resolve();
          }}
          paypalMessages={acceptPayLater ? payPalMessagesParams('cart', demoPrice.toString()) : undefined}
          onApproveRedirectionUrl="https://poc-mediaopt2.frontend.site/cart"
        />
      ) : (
        <button
          type="button"
          onClick={manageCart}
          className="flex w-full flex-1 items-center justify-center rounded-md border border-transparent bg-accent-400 fill-white py-3 px-8 text-base font-medium text-white transition duration-150 ease-out hover:bg-accent-500 focus:bg-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-gray-50 disabled:bg-gray-400"
        >
          Buy Now
        </button>
      )}
    </main>
  );
};

export default CartCheckout;
