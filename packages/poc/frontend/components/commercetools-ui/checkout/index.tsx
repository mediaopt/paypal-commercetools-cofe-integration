import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Address } from '@Types/account/Address';
import { ShippingMethod } from '@Types/cart/ShippingMethod';
import * as yup from 'yup';
import { ObjectShape } from 'yup/lib/object';
import EmptyCart from 'components/commercetools-ui/cart/emptyCart';
import { CurrencyHelpers } from 'helpers/currencyHelpers';
import { useFormat } from 'helpers/hooks/useFormat';
import useI18n from 'helpers/hooks/useI18n';
import { Reference } from 'helpers/reference';
import { useAccount, useCart } from 'frontastic';
import CheckoutForm, { ShippingCountryItem } from './checkout-form';
import GuestCheckoutForm from './checkout-form/guest';
import DesktopOrderSummary from './order-summary/order-summary-desktop';
import MobileOrderSummary from './order-summary/order-summary-mobile';

interface Props {
  loginLink?: Reference;
  shippingCountryOptions?: ShippingCountryItem[];
}

const Checkout = ({ shippingCountryOptions }: Props) => {
  //i18n messages
  const { formatMessage: formatCartMessage } = useFormat({ name: 'cart' });
  const { formatMessage: formatCheckoutMessage } = useFormat({ name: 'checkout' });
  const [submittingForm, setSubmittingForm] = useState(false);

  //account data
  const { loggedIn } = useAccount();

  //cart data
  const { data, removeItem, getShippingMethods, setShippingMethod, updateCart, checkout } = useCart();

  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>(null);

  //i18n data
  const { country } = useI18n();
  const defaultCountry = country || 'DE';

  //account data
  const { account } = useAccount();

  //next/router
  const router = useRouter();

  //some products are out of stock?
  const someOutOfStock = !!data?.lineItems?.find((item) => !item.variant.isOnStock);

  useEffect(() => {
    getShippingMethods().then((data) => {
      setShippingMethods(data);
    });
  }, []);

  //checkout data
  const [checkoutData, setCheckoutData] = useState({
    firstName: '',
    lastName: '',
    emailAddress: '',
    nameOnCard: '',
    cardNumber: '',
    expirationDate: '',
    cvc: '',
    streetName: '',
    streetNumber: '',
    city: '',
    postalCode: '',
    country: defaultCountry,
    shippingStreetName: '',
    shippingStreetNumber: '',
    shippingCity: '',
    shippingPostalCode: '',
    shippingCountry: defaultCountry,
    billingAddress: account?.addresses.find((address) => address.isDefaultBillingAddress)?.addressId ?? '',
    shippingAddress: account?.addresses.find((address) => address.isDefaultShippingAddress)?.addressId ?? '',
    invoiceId: '',
    pay: 'cc',
  });

  const updateFormInput = (propName: string, newValue: string) => {
    setCheckoutData({ ...checkoutData, [propName]: newValue });
  };

  const editLineItem = () => router.push('/cart');

  const goToProductPage = (_url: string) => router.push(_url);

  const removeLineItem = (lineItemId: string) => removeItem(lineItemId);

  const isItemsValid = () => {
    return !someOutOfStock;
  };

  const isCheckoutDataValid = () => {
    //scheme for logged in users
    const loggedInScheme = yup.object().shape({
      billingAddress: yup.string().required(),
      shippingAddress: yup.string().optional(),
    });

    //scheme for guest users
    const guestScheme = yup.object().shape({
      streetName: yup.string().required(),
      streetNumber: yup.string().required(),
      city: yup.string().required(),
      postalCode: yup.string().required(),
      country: yup.string().required(),
      shippingStreetName: yup.string().optional(),
      shippingStreetNumber: yup.string().optional(),
      shippingCity: yup.string().optional(),
      shippingPostalCode: yup.string().optional(),
      shippingCountry: yup.string().optional(),
    });

    //merged scheme
    const scheme = yup
      .object()
      .shape({
        firstName: yup.string().required(),
        lastName: yup.string().required(),
        emailAddress: yup.string().email(),
      })
      .concat((loggedIn ? loggedInScheme : guestScheme) as yup.ObjectSchema<ObjectShape>);
    return scheme.isValidSync(checkoutData);
  };

  const isValid = () => {
    return isCheckoutDataValid() && isItemsValid();
  };

  const submitForm = async () => {
    setSubmittingForm(true);
    //validation for shipping address for guests
    const isValidShippingAddress =
      !!checkoutData.shippingCity &&
      !!checkoutData.shippingCountry &&
      !!checkoutData.shippingPostalCode &&
      !!checkoutData.shippingStreetName &&
      !!checkoutData.shippingStreetNumber;

    const shippingAddress = loggedIn
      ? account.addresses.find((address) => address.addressId === checkoutData.shippingAddress)
      : ((isValidShippingAddress
          ? {
              firstName: checkoutData.firstName,
              lastName: checkoutData.lastName,
              streetName: checkoutData.shippingStreetName,
              streetNumber: checkoutData.shippingStreetNumber,
              city: checkoutData.shippingCity,
              country: checkoutData.shippingCountry,
              postalCode: checkoutData.shippingPostalCode,
            }
          : null) as Address);

    const billingAddress: Address = loggedIn
      ? account.addresses.find((address) => address.addressId === checkoutData.billingAddress)
      : ({
          firstName: checkoutData.firstName,
          lastName: checkoutData.lastName,
          streetName: checkoutData.streetName,
          streetNumber: checkoutData.streetNumber,
          city: checkoutData.city,
          country: checkoutData.country,
          postalCode: checkoutData.postalCode,
        } as Address);

    await updateCart({
      account: {
        email: checkoutData.emailAddress,
      },
      billing: billingAddress,
      shipping: shippingAddress || billingAddress,
    });
    const deliveryCountry = shippingAddress?.country ?? billingAddress.country;
    const relevantShipping = shippingMethods?.find(({ rates }) =>
      rates.some(({ locations }) => locations.some(({ country }) => country === deliveryCountry)),
    );
    if (relevantShipping) await setShippingMethod(relevantShipping.shippingMethodId);
    setSubmittingForm(false);
  };

  if (!submittingForm && (!data?.lineItems || data.lineItems.length < 1)) {
    return <EmptyCart />;
  }

  return (
    <main className="py-10 lg:flex lg:min-h-full lg:flex-row-reverse lg:overflow-hidden">
      <h1 className="sr-only">{formatCartMessage({ id: 'checkout', defaultMessage: 'Checkout' })}</h1>
      <MobileOrderSummary
        cart={data}
        editCartItem={editLineItem}
        goToProductPage={goToProductPage}
        removeCartItem={removeLineItem}
        selectedShipping={shippingMethods?.[0]}
        someOutOfStock={someOutOfStock}
      />
      <DesktopOrderSummary
        cart={data}
        editCartItem={editLineItem}
        goToProductPage={goToProductPage}
        removeCartItem={removeLineItem}
        selectedShipping={shippingMethods?.[0]}
        someOutOfStock={someOutOfStock}
      />
      <section
        aria-labelledby="payment-heading"
        className="flex-auto overflow-y-auto px-4 pt-12 pb-16 sm:px-6 sm:pt-16 lg:px-8 lg:pt-0 lg:pb-24"
      >
        {shippingMethods && (
          <div className="mx-auto max-w-lg">
            {loggedIn ? (
              <CheckoutForm
                submitText={`${formatCheckoutMessage({
                  id: 'pay',
                  defaultMessage: 'Pay',
                })} ${CurrencyHelpers.formatForCurrency(
                  CurrencyHelpers.addCurrency(data.sum, shippingMethods?.[0]?.rates?.[0]?.price || {}),
                )}`}
                updateFormInput={updateFormInput}
                submitForm={submitForm}
                data={checkoutData}
                isFormValid={isValid()}
                account={account}
                loggedIn={loggedIn}
                shippingCountryOptions={shippingCountryOptions}
              />
            ) : (
              <GuestCheckoutForm
                submitText={`${formatCheckoutMessage({
                  id: 'pay',
                  defaultMessage: 'Pay',
                })} ${CurrencyHelpers.formatForCurrency(
                  CurrencyHelpers.addCurrency(data.sum, shippingMethods?.[0]?.rates?.[0]?.price || {}),
                )}`}
                updateFormInput={updateFormInput}
                submitForm={submitForm}
                data={checkoutData}
                isFormValid={isValid()}
                shippingCountryOptions={shippingCountryOptions}
              />
            )}
          </div>
        )}
      </section>
    </main>
  );
};

export default Checkout;
