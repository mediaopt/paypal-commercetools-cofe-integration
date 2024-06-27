import { ReactNode } from 'react';
import { FUNDING_SOURCE } from '@paypal/paypal-js';

export type PaymentMethodsType = {
  id: string;
  label: string;
  value: string;
  isDefault: boolean;
  component: ReactNode;
  countries?: string[];
}[];

export type AvailablePaymentMethods = {
  key: FUNDING_SOURCE;
  countries?: string[];
  additionalOptions?: { [key: string]: string | string[] };
  component?: JSX.Element;
};
