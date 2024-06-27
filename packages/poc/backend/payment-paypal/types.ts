export type GetUserIdTokenResponse = { userIdToken?: string; version?: number; paymentTokens?: [] };

type FUNDING_SOURCE =
  | 'paypal'
  | 'venmo'
  | 'applepay'
  | 'itau'
  | 'credit'
  | 'paylater'
  | 'card'
  | 'ideal'
  | 'sepa'
  | 'bancontact'
  | 'giropay'
  | 'sofort'
  | 'eps'
  | 'mybank'
  | 'p24'
  | 'verkkopankki'
  | 'payu'
  | 'blik'
  | 'trustly'
  | 'zimpler'
  | 'maxima'
  | 'oxxo'
  | 'boletobancario'
  | 'wechatpay'
  | 'mercadopago'
  | 'multibanco';

export type CreateOrderData = {
  paymentSource?: FUNDING_SOURCE | 'apple_pay' | 'google_pay';
  storeInVault?: boolean;
  vaultId?: string;
  verificationMethod?: string;
};

export type CreateInvoiceData = {
  birthDate?: string;
  fraudNetSessionId?: string;
  countryCode?: string;
  nationalNumber?: string;
};

export type CreatePayPalOrderData = CreateOrderData & CreateInvoiceData;

export type CreatePayPalOrderRequestBody = {
  paymentId: string;
  paymentVersion: number;
  orderData?: CreatePayPalOrderData;
};
