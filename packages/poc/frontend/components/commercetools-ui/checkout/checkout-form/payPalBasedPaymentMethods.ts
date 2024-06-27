import { FUNDING_SOURCE } from '@paypal/paypal-js';
import { AvailablePaymentMethods } from '../../../../types';

const localBanksOptions = { components: 'buttons,payment-fields,marks,funding-eligibility', clientId: 'test' };

const availablePaymentMethods: AvailablePaymentMethods[] = [
  {
    key: 'paypal',
    additionalOptions: {
      enableFunding: 'paylater',
      disableFunding: ['sepa', 'card', 'giropay', 'sofort'],
      components: 'messages,buttons',
    },
  },

  { key: 'sepa', countries: ['DE'] },
  {
    key: 'giropay',
    countries: ['DE'],
    additionalOptions: {
      ...localBanksOptions,
      enableFunding: 'giropay',
    },
  },
  { key: 'venmo', countries: ['US'], additionalOptions: { enableFunding: 'venmo', buyerCountry: 'US' } },

  {
    key: 'bancontact',
    countries: ['BE'],
    additionalOptions: {
      ...localBanksOptions,
      enableFunding: 'bancontact',
    },
  },
  {
    key: 'blik',
    countries: ['PL'],
    additionalOptions: {
      ...localBanksOptions,
      enableFunding: 'blik',
      currency: 'PLN',
    },
  },
  {
    key: 'eps',
    countries: ['AT'],
    additionalOptions: {
      ...localBanksOptions,
      enableFunding: 'eps',
    },
  },
  {
    key: 'ideal',
    countries: ['NL'],
    additionalOptions: {
      ...localBanksOptions,
      enableFunding: 'ideal',
    },
  },
  {
    key: 'mybank',
    countries: ['IT'],
    additionalOptions: {
      ...localBanksOptions,
      enableFunding: 'mybank',
    },
  },
  {
    key: 'p24',
    countries: ['PL'],
    additionalOptions: {
      ...localBanksOptions,
      enableFunding: 'p24',
    },
  },
];

export const filteredMethods = (acceptPayLater?: boolean) => {
  const filteringRule = (key: FUNDING_SOURCE) => (acceptPayLater ? key : key !== 'paylater');
  return availablePaymentMethods.filter(({ key }) => filteringRule(key));
};
