import { useEffect, useMemo, useState } from 'react';

import { Account } from '@Types/account/Account';
import { useFormat } from 'helpers/hooks/useFormat';

import FormCheckbox from './fields/formCheckbox';
import FormSelect from './fields/formSelect';
import { addressDataGroup, formDataGroup } from './fields/formSummary';
import { PaymentMethods } from './fields/formPayment';
import { getCountryName } from '../../../../helpers/countryOptions';
import { useCheckoutData } from '../../../../helpers/hooks/useCheckoutData';

export interface ShippingCountryItem {
  display: string;
  data: string;
}
export interface Props {
  readonly submitText: string;
  readonly updateFormInput: (propName: string, newValue: string) => void;
  readonly submitForm: () => void;
  readonly data: { [inputName: string]: string };
  readonly isFormValid: boolean;
  account: Account;
  loggedIn: boolean;
  readonly shippingCountryOptions: ShippingCountryItem[];
}

const CheckoutForm = ({ submitText, updateFormInput, submitForm, data, account }: Props) => {
  //i18n messages
  const { formatMessage: formatCheckoutMessage } = useFormat({ name: 'checkout' });

  //available addresses to choose from
  const addresses = (account?.addresses ?? []).map((address) => ({
    display: `${address.firstName} ${address.lastName} - ${address.city} - ${address.streetName} ${
      address.streetNumber
    } - ${getCountryName(address.country)}`,
    data: address.addressId,
  }));

  //use billing address as shipping address
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);

  useEffect(() => {
    if (billingSameAsShipping) updateFormInput('shippingAddress', data.billingAddress);
    else updateFormInput('shippingAddress', '');
  }, [billingSameAsShipping, data.billingAddress]);

  //account.addresses - real address
  const billingAddress = account.addresses.filter((address) => address.addressId === data.billingAddress);
  const shippingAddress = account.addresses.filter((address) => address.addressId === data.shippingAddress);

  const billingAddressData = billingAddress[0] ?? account.addresses[0] ?? {};

  const shippingAddressData = billingSameAsShipping ? billingAddressData : shippingAddress[0] ?? billingAddressData;

  const requiredAddressData = useMemo(() => {
    return {
      firstName: account.firstName,
      lastName: account.lastName,
      streetName: data.streetName,
      streetNumber: data.streetNumber,
      city: data.city,
      country: data.country ?? 'DE',
      postalCode: data.postalCode,
    };
  }, [account.firstName, account.lastName]);

  const billingInformation = useMemo(() => {
    return {
      ...requiredAddressData,
      ...billingAddressData,
    };
  }, [requiredAddressData, billingAddressData]);

  const shippingInformation = useMemo(() => {
    return {
      ...requiredAddressData,
      ...shippingAddressData,
    };
  }, [requiredAddressData, shippingAddressData]);

  if (data.emailAddress === '' || !data.emailAddress) {
    data.emailAddress = account.email;
  }

  const { cartInformation, invoiceData } = useCheckoutData(
    data,
    billingSameAsShipping,
    billingInformation,
    shippingInformation,
    submitText,
    submitForm,
  );

  return (
    <div className="mt-6">
      <div className="grid grid-cols-12 gap-x-4 gap-y-6">
        <div className="col-span-full bg-gray-50 text-sm font-medium ">
          {formDataGroup(
            formatCheckoutMessage({
              id: 'contactData',
              defaultMessage: 'Contact',
            }),
            [[account.firstName, account.lastName], [account.email]],
          )}
          {addresses.length === 1 &&
            formDataGroup(
              formatCheckoutMessage({
                id: 'addressData',
                defaultMessage: 'Billing and shipping',
              }),
              addressDataGroup(account.addresses[0]),
            )}
        </div>
        <FormSelect
          name="billingAddress"
          label={formatCheckoutMessage({ id: 'billingAddress', defaultMessage: 'Billing address' })}
          options={addresses}
          selectedOptionValue={data.billingAddress}
          onChange={updateFormInput}
          containerClassName="col-span-full"
        />
        {!billingSameAsShipping && (
          <FormSelect
            name="shippingAddress"
            label={formatCheckoutMessage({ id: 'shippingAddress', defaultMessage: 'Shipping address' })}
            options={addresses}
            selectedOptionValue={data.shippingAddress}
            onChange={updateFormInput}
            containerClassName="col-span-full"
          />
        )}
        <FormCheckbox
          checked={billingSameAsShipping}
          onChange={(checked) => {
            setBillingSameAsShipping(checked);
          }}
          name="sameAsShipping"
          label={formatCheckoutMessage({
            id: 'billingAddressSameAsShipping',
            defaultMessage: 'Billing address is the same as shipping address',
          })}
          inverseLabel
          containerClassNames="flex items-center gap-4 col-span-full"
        />
        <PaymentMethods updateFormInput={updateFormInput} invoiceData={invoiceData} cartInformation={cartInformation} />
      </div>
    </div>
  );
};

export default CheckoutForm;
