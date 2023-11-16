import React from 'react';
import Checkout from '../../../components/commercetools-ui/checkout';
const exampleCountries = ['us', 'de', 'it', 'nl', 'at', 'gb', 'pl', 'sg', 'be'];
import { getCountryOptions } from '../../../helpers/countryOptions';

const CheckoutTastic = ({ data }) => {
  return <Checkout shippingCountryOptions={getCountryOptions(exampleCountries)} />;
};

export default CheckoutTastic;
