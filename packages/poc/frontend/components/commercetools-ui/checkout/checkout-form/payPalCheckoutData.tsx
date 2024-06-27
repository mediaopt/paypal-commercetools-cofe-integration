import cookieCutter from 'cookie-cutter';
import { NextRouter } from 'next/router';
import { CartInformation } from 'paypal-commercetools-client/dist/esm/src/types';
import { CartDetails } from 'frontastic/actions/cart';

const dummyAddress = {
  firstName: '',
  lastName: '',
  streetName: '',
  streetNumber: '',
  city: '',
  country: '',
  postalCode: '',
};

const dummyCartInformation = {
  account: {
    email: '',
  },
  billing: { ...dummyAddress },
  shipping: { ...dummyAddress },
};

export const payPalCheckoutData = (
  cartInformation?: CartInformation,
  checkout?: (payload?: CartDetails) => Promise<void>,
  router?: NextRouter,
  isCartCheckout = false,
  loggedIn = false,
  resultPage = '/thank-you',
) => {
  const requestHeader = {
    'Frontastic-Session': cookieCutter.get ? cookieCutter.get('frontastic-session') : '',
    'Commercetools-Frontend-Extension-Version': process.env.NEXT_PUBLIC_EXT_BUILD_ID ?? 'dev',
  };

  const baseUrl = 'https://poc-mediaopt2.frontastic.rocks/frontastic/action/';

  const commonParams = {
    getSettingsUrl: `${baseUrl}settings/getPayPalSettings`,
    getClientTokenUrl: `${baseUrl}payment/getClientToken`,
    createPaymentUrl: `${baseUrl}payment/createPayment`,
  };

  const vaultParams = {
    getUserInfoUrl: loggedIn ? `${baseUrl}payment/getUserInfo` : undefined,
    enableVaulting: loggedIn,
  };

  const params = {
    ...commonParams,
    createOrderUrl: `${baseUrl}payment/createPayPalOrder`,
    onApproveUrl: `${baseUrl}payment/capturePayPalOrder`,
    authorizeOrderUrl: `${baseUrl}payment/authorizePayPalOrder`,
    authenticateThreeDSOrderUrl: `${baseUrl}payment/authenticateThreeDSOrder`,
    shippingMethodId: '',
    cartInformation: cartInformation ? { ...dummyCartInformation, ...cartInformation } : { ...dummyCartInformation },

    ...vaultParams,
  };

  const vaultOnlyParams = {
    ...commonParams,
    createVaultSetupTokenUrl: `${baseUrl}payment/createVaultSetupToken`,
    approveVaultSetupTokenUrl: `${baseUrl}payment/approveVaultSetupToken`,
    shippingMethodId: '',
    ...vaultParams,
  };

  const options = {
    clientId: 'AQlyw_Usbq3XVXnbs2JfrtmDAzJ2ECVzs4WM7Nm9QkoOWb8_s_C6-bkgs0o4ggzCYp_RhJO5OLS_sEi9',
    currency: 'EUR',
    components: 'messages,buttons',
    commit: !isCartCheckout,
  };

  type FraudnetPage =
    | 'home-page'
    | 'search-result-page'
    | 'category-page'
    | 'product-detail-page'
    | 'cart-page'
    | 'inline-cart-page'
    | 'checkout-page';

  const paypalInvoiceParams = {
    merchantId: 'W3KJAHBNV5BS6',
    pageId: 'checkout-page' as FraudnetPage,
    invoiceBenefitsMessage:
      'Once you place an order, pay within 30 days. Our partner Ratepay will send you the instructions.',
    minPayableAmount: 5, //euro
    maxPayableAmount: 2500, //euro
  };

  const purchaseCallback = async (result, options) => {
    if (checkout && router) {
      if (result?.cart?.shippingAddress?.streetName || loggedIn || result?.payment_source?.pay_upon_invoice) {
        await checkout();
      } else {
        const { streetName, streetNumber, city, country, postalCode } = result.cart.shippingAddress ?? {};
        const payer = result.orderData.payer;
        await checkout({
          account: {
            email: payer?.email_address ?? result.cart.email,
          },
          billing: {
            firstName: payer?.name?.given_name ?? result.cart.firstName,
            lastName: payer?.name?.surname ?? result.cart.lastName,
            streetName,
            streetNumber,
            city,
            country,
            postalCode,
          },
        });
      }

      router.push(resultPage);
    } else console.log('Do something', result, options);
  };
  return { requestHeader, params, options, purchaseCallback, paypalInvoiceParams, baseUrl, vaultOnlyParams };
};
