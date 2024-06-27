'use client';

import { useEffect, useMemo, useState } from 'react';

import { useFormat } from 'helpers/hooks/useFormat';

import FormButton from './fields/formButton';
import FormCheckbox from './fields/formCheckbox';
import FormInput from './fields/formInput';
import FormSelect from './fields/formSelect';
import { addressDataGroup, formDataGroup } from './fields/formSummary';
import { PaymentMethods } from './fields/formPayment';

import { ShippingCountryItem } from './index';
import { useCheckoutData } from '../../../../helpers/hooks/useCheckoutData';

interface Props {
  readonly submitText: string;
  readonly updateFormInput: (propName: string, newValue: string) => void;
  readonly submitForm: () => void;
  readonly data: { [inputName: string]: string };
  readonly isFormValid: boolean;
  readonly shippingCountryOptions: ShippingCountryItem[];
}

const CheckoutForm = ({
  submitText,
  updateFormInput,
  submitForm,
  data,
  isFormValid,
  shippingCountryOptions,
}: Props) => {
  //i18n messages
  const { formatMessage } = useFormat({ name: 'common' });
  const { formatMessage: formatCheckoutMessage } = useFormat({ name: 'checkout' });

  //use billing address as shipping address
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);

  useEffect(() => {
    if (billingSameAsShipping) updateFormInput('shippingAddress', data.billingAddress);
    else updateFormInput('shippingAddress', '');
  }, [billingSameAsShipping, data.billingAddress]);

  const [isAddressIncomplete, setIsAddressIncomplete] = useState(true);

  const billingInformation = useMemo(() => {
    return {
      firstName: data.firstName,
      lastName: data.lastName,
      streetName: data.streetName,
      streetNumber: data.streetNumber,
      city: data.city,
      country: data.country ?? 'DE',
      postalCode: data.postalCode,
    };
  }, [data.firstName, data.lastName, data.streetName, data.streetNumber, data.city, data.country, data.postalCode]);

  const shippingInformation = useMemo(() => {
    return {
      firstName: data.firstName,
      lastName: data.lastName,
      streetName: data.shippingStreetName,
      streetNumber: data.shippingStreetNumber,
      city: data.shippingCity,
      country: data.shippingCountry ?? data.country ?? 'DE',
      postalCode: data.shippingPostalCode,
    };
  }, [
    data.firstName,
    data.lastName,
    data.shippingStreetName,
    data.shippingStreetNumber,
    data.shippingCity,
    data.shippingCountry,
    data.country,
    data.shippingPostalCode,
  ]);

  const { cartInformation } = useCheckoutData(
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
        {isAddressIncomplete && (
          <>
            <FormInput
              name="firstName"
              inputAutoComplete="given-name"
              label={formatMessage({ id: 'firstName', defaultMessage: 'First Name' })}
              value={data.firstName}
              onChange={updateFormInput}
              containerClassNames="col-span-6 sm:col-span-6"
            />
            <FormInput
              name="lastName"
              inputAutoComplete="family-name"
              label={formatMessage({ id: 'lastName', defaultMessage: 'Last Name' })}
              value={data.lastName}
              onChange={updateFormInput}
              containerClassNames="col-span-6 sm:col-span-6"
            />
            <FormInput
              name="emailAddress"
              inputType="email"
              inputAutoComplete="email"
              label={formatMessage({ id: 'emailAddress', defaultMessage: 'Email Address' })}
              value={data.emailAddress}
              onChange={updateFormInput}
            />
            <div className="col-span-full pt-8">
              <label className="text-base font-medium text-gray-900 dark:text-light-100">
                {formatCheckoutMessage({ id: 'billingAddress', defaultMessage: 'Billing address' })}
              </label>
            </div>
            <FormInput
              name="streetName"
              inputAutoComplete="address-line1"
              label={formatMessage({ id: 'street.name', defaultMessage: 'Street Name' })}
              value={data.streetName}
              onChange={updateFormInput}
              containerClassNames="col-span-full sm:col-span-9"
            />
            <FormInput
              name="streetNumber"
              label={formatMessage({ id: 'street.number', defaultMessage: 'Street No.' })}
              value={data.streetNumber}
              onChange={updateFormInput}
              containerClassNames="col-span-full sm:col-span-3"
            />
            <FormInput
              name="city"
              inputAutoComplete="address-level2"
              label={formatMessage({ id: 'city', defaultMessage: ' City' })}
              value={data.city}
              onChange={updateFormInput}
              containerClassNames="col-span-full sm:col-span-4"
            />
            <FormInput
              name="postalCode"
              inputAutoComplete="postal-code"
              label={formatMessage({ id: 'zipCode', defaultMessage: 'Postal code' })}
              value={data.postalCode}
              onChange={updateFormInput}
              containerClassNames="col-span-full sm:col-span-4"
            />
            <FormSelect
              name="country"
              label={formatMessage({ id: 'country', defaultMessage: 'Country' })}
              options={shippingCountryOptions}
              selectedOptionValue={(data.country as string) || undefined}
              onChange={updateFormInput}
              containerClassName="col-span-full sm:col-span-4"
            />
            {!billingSameAsShipping && (
              <>
                <div className="col-span-full pt-6">
                  <label className="text-base font-medium text-gray-900 dark:text-light-100">
                    {formatCheckoutMessage({ id: 'shippingAddress', defaultMessage: 'Shipping address' })}
                  </label>
                </div>
                <FormInput
                  name="shippingStreetName"
                  label={formatMessage({ id: 'street.name', defaultMessage: 'Street Name' })}
                  value={data.shippingStreetName}
                  onChange={updateFormInput}
                  containerClassNames="col-span-full sm:col-span-9"
                />
                <FormInput
                  name="shippingStreetNumber"
                  label={formatMessage({ id: 'street.number', defaultMessage: 'Street No.' })}
                  value={data.shippingStreetNumber}
                  onChange={updateFormInput}
                  containerClassNames="col-span-full sm:col-span-3"
                />
                <FormInput
                  name="shippingCity"
                  inputAutoComplete="address-level2"
                  label={formatMessage({ id: 'city', defaultMessage: ' City' })}
                  value={data.shippingCity}
                  onChange={updateFormInput}
                  containerClassNames="col-span-full sm:col-span-4"
                />
                <FormInput
                  name="shippingPostalCode"
                  inputAutoComplete="postal-code"
                  label={formatMessage({ id: 'zipCode', defaultMessage: 'Postal code' })}
                  value={data.shippingPostalCode}
                  onChange={updateFormInput}
                  containerClassNames="col-span-full sm:col-span-4"
                />
                <FormSelect
                  name="shippingCountry"
                  label={formatMessage({ id: 'country', defaultMessage: 'Country' })}
                  options={shippingCountryOptions}
                  selectedOptionValue={(data.shippingCountry as string) || (data.country as string) || undefined}
                  onChange={updateFormInput}
                  containerClassName="col-span-full sm:col-span-4"
                />
              </>
            )}
            <FormCheckbox
              checked={billingSameAsShipping}
              onChange={(checked) => setBillingSameAsShipping(checked)}
              name="sameAsShipping"
              label={formatCheckoutMessage({
                id: 'billingAddressSameAsShipping',
                defaultMessage: 'Billing address is the same as shipping address',
              })}
              inverseLabel
              containerClassNames="flex items-center gap-4 col-span-full"
            />
            <div className="col-span-full">
              <FormButton
                buttonText={'Next >'}
                onClick={() => {
                  submitForm();
                  setIsAddressIncomplete(false);
                }}
                isDisabled={!isFormValid}
              />
            </div>
          </>
        )}

        {!isAddressIncomplete && (
          <>
            <div className="col-span-full bg-gray-50 text-sm font-medium ">
              {formDataGroup(
                formatCheckoutMessage({
                  id: 'contactData',
                  defaultMessage: 'Email address',
                }),
                [[data.emailAddress]],
              )}
              <div className="mt-6 grid grid-flow-col grid-rows-5 gap-x-2 gap-y-1">
                {formDataGroup(
                  formatCheckoutMessage({
                    id: 'addressData',
                    defaultMessage: billingSameAsShipping ? 'Billing and shipping' : 'Billing address',
                  }),
                  addressDataGroup(billingInformation),
                )}

                {!billingSameAsShipping && (
                  <>
                    {formDataGroup(
                      formatCheckoutMessage({ id: 'shippingAddressData', defaultMessage: 'Shipping address' }),
                      addressDataGroup(shippingInformation),
                    )}
                  </>
                )}
              </div>
              <FormButton
                buttonText={'< Back'}
                onClick={() => {
                  setIsAddressIncomplete(true);
                }}
                isDisabled={!isFormValid}
              />
            </div>
            <PaymentMethods updateFormInput={updateFormInput} cartInformation={cartInformation} />
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutForm;
