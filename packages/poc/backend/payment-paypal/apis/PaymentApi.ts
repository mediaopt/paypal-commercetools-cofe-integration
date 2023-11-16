import axios from 'axios';
import { BaseApi } from '@Commerce-commercetools/apis/BaseApi';

import { CreatePayPalOrderData } from '../types';

const createOrderValue = (orderData: CreatePayPalOrderData) => {
  const { fraudNetSessionId, birthDate, countryCode, nationalNumber } = orderData;
  if (fraudNetSessionId && birthDate && countryCode && nationalNumber)
    return JSON.stringify({
      clientMetadataId: fraudNetSessionId,
      payment_source: {
        pay_upon_invoice: {
          birth_date: birthDate,
          phone: {
            country_code: countryCode,
            national_number: nationalNumber,
          },
        },
      },
    });
  else {
    const createOrderValueObject = { storeInVaultOnSuccess: orderData.storeInVault, paymentSource: {} };
    createOrderValueObject.paymentSource[orderData.paymentSource] = {
      experience_context:
        orderData.paymentSource === 'paypal'
          ? {
              //You need to create pages for these in CoFe
              return_url: 'https://poc-mediaopt2.frontend.site/',
              cancel_url: 'https://poc-mediaopt2.frontend.site/',
            }
          : undefined,
      vault_id: orderData.vaultId ?? undefined,
    };
    return JSON.stringify(createOrderValueObject);
  }
};

export class PaymentApi extends BaseApi {
  protected instance = axios.create({
    baseURL: `${this.clientSettings.hostUrl}/${this.clientSettings.projectKey}`,
    headers: {
      Authorization: `Bearer ${this.token.token}`,
      'content-type': 'application/json',
    },
  });

  getCustomer: (accountId: string) => Promise<{
    firstName: string;
    lastName: string;
    email: string;
    companyName: string;
    customerVersion: number;
    custom: any;
  }> = async (accountId: string) => {
    const account = await this.requestBuilder()
      .customers()
      .withId({ ID: accountId })
      .get()
      .execute()
      .then((response) => {
        return response.body;
      })
      .catch((error) => {
        throw error;
      });

    const { custom, firstName, lastName, email, companyName, version: customerVersion } = account;

    return {
      custom,
      firstName,
      lastName,
      email,
      companyName,
      customerVersion,
    };
  };

  createOrder: (
    paymentId: string,
    paymentVersion: number,
    setCustomType: boolean,
    orderData: CreatePayPalOrderData,
  ) => Promise<{ orderData: string; paymentVersion: number; createOrderValue: any }> = async (
    paymentId: string,
    paymentVersion: number,
    setCustomType: boolean,
    orderData: CreatePayPalOrderData,
  ) => {
    const actions = [];

    if (setCustomType) {
      actions.push({
        action: 'setCustomType',
        type: {
          key: 'paypal-payment-type',
          typeId: 'type',
        },
      });
    }

    const orderValue = createOrderValue(orderData);

    actions.push({
      action: 'setCustomField',
      name: 'createPayPalOrderRequest',
      value: orderValue,
    });

    const payload = {
      version: paymentVersion,
      actions,
    };

    try {
      const response = await this.instance.post<{
        custom: { fields: { createPayPalOrderResponse: string } };
        version: number;
      }>(`/payments/${paymentId}`, payload);

      return {
        orderData: response.data.custom.fields.createPayPalOrderResponse,
        paymentVersion: response.data.version,
        createOrderValue: actions,
      };
    } catch (error) {
      throw error;
    }
  };

  captureOrder: (
    paymentId: string,
    paymentVersion: number,
    orderID: string,
  ) => Promise<{ captureOrderData: string; paymentVersion: number }> = async (
    paymentId: string,
    paymentVersion: number,
    orderID: string,
  ) => {
    const payload = {
      version: paymentVersion,
      actions: [
        {
          action: 'setCustomField',
          name: 'capturePayPalOrderRequest',
          value: JSON.stringify({ orderId: orderID }),
        },
      ],
    };

    try {
      const response = await this.instance.post<{
        custom: { fields: { capturePayPalOrderResponse: string } };
        version: number;
      }>(`/payments/${paymentId}`, payload);

      return {
        captureOrderData: response.data.custom.fields.capturePayPalOrderResponse,
        paymentVersion: response.data.version,
      };
    } catch (error) {
      throw error;
    }
  };

  authorizeOrder: (
    paymentId: string,
    paymentVersion: number,
    orderID: string,
  ) => Promise<{ authorizeOrderData: string; paymentVersion: number }> = async (
    paymentId: string,
    paymentVersion: number,
    orderID: string,
  ) => {
    const payload = {
      version: paymentVersion,
      actions: [
        {
          action: 'setCustomField',
          name: 'authorizePayPalOrderRequest',
          value: JSON.stringify({ orderId: orderID }),
        },
      ],
    };

    try {
      const response = await this.instance.post<{
        custom: { fields: { authorizePayPalOrderResponse: string } };
        version: number;
      }>(`/payments/${paymentId}`, payload);

      return {
        authorizeOrderData: response.data.custom.fields.authorizePayPalOrderResponse,
        paymentVersion: response.data.version,
      };
    } catch (error) {
      throw error;
    }
  };

  getClientToken: (
    paymentId: string,
    paymentVersion: number,
  ) => Promise<{ clientToken: string; paymentVersion: number }> = async (paymentId: string, paymentVersion: number) => {
    const payload = {
      version: paymentVersion,
      actions: [
        {
          action: 'setCustomType',
          type: {
            key: 'paypal-payment-type',
            typeId: 'type',
          },
          fields: {
            getClientTokenRequest: JSON.stringify({}),
          },
        },
      ],
    };

    try {
      const response = await this.instance.post<{
        custom: { fields: { getClientTokenResponse: string } };
        version: number;
      }>(`/payments/${paymentId}`, payload);

      return {
        clientToken: response.data.custom.fields.getClientTokenResponse,
        paymentVersion: response.data.version,
      };
    } catch (error) {
      throw error;
    }
  };

  getUserInfo: (
    accountId: string,
    version: number,
  ) => Promise<{ getUserIDTokenResponse: string; getPaymentTokensResponse: string; version: number }> = async (
    accountId: string,
    version: number,
  ) => {
    const payloadGetUserIdToken = {
      version: version,
      actions: [
        {
          action: 'setCustomField',
          name: 'getUserIDTokenRequest',
          value: '{}',
        },
      ],
    };
    const payloadGetPaymentTokens = {
      version: version,
      actions: [
        {
          action: 'setCustomField',
          name: 'getPaymentTokensRequest',
          value: '{}',
        },
      ],
    };

    try {
      const responseGetUserIdToken = await this.instance.post<{
        custom: { fields: { getUserIDTokenResponse: string } };
        version: number;
      }>(`/customers/${accountId}`, payloadGetUserIdToken);
      const { getUserIDTokenResponse } = responseGetUserIdToken.data.custom.fields;

      payloadGetPaymentTokens.version = responseGetUserIdToken.data.version;
      const responseGetPaymentTokens = await this.instance.post<{
        custom: { fields: { getPaymentTokensResponse: string } };
        version: number;
      }>(`/customers/${accountId}`, payloadGetPaymentTokens);
      const { getPaymentTokensResponse } = responseGetPaymentTokens.data.custom.fields;

      return {
        getUserIDTokenResponse: getUserIDTokenResponse,
        getPaymentTokensResponse: getPaymentTokensResponse,
        version: responseGetPaymentTokens.data.version,
      };
    } catch (error) {
      throw error;
    }
  };

  removePaymentToken: (
    accountId: string,
    version: number,
    paymentTokenId: string,
  ) => Promise<{ getUserIDTokenResponse: string; getPaymentTokensResponse: string; version: number }> = async (
    accountId: string,
    version: number,
    paymentTokenId: string,
  ) => {
    const payload = {
      version: version,
      actions: [
        {
          action: 'setCustomField',
          name: 'deletePaymentTokenRequest',
          value: paymentTokenId,
        },
      ],
    };

    try {
      const response = await this.instance.post<{
        custom: { fields: { getUserIDTokenResponse: string; getPaymentTokensResponse: string } };
        version: number;
      }>(`/customers/${accountId}`, payload);

      const { getUserIDTokenResponse, getPaymentTokensResponse } = response.data.custom.fields;

      return {
        getUserIDTokenResponse: getUserIDTokenResponse,
        getPaymentTokensResponse: getPaymentTokensResponse,
        version: response.data.version,
      };
    } catch (error) {
      throw error;
    }
  };

  createVaultSetupToken: (
    accountId: string,
    version: number,
    paymentSource: string,
  ) => Promise<{ createVaultSetupTokenResponse: string; version: number }> = async (
    accountId: string,
    version: number,
    paymentSource: string,
  ) => {
    let payloadValue = {};
    if (paymentSource === 'paypal') {
      payloadValue = {
        payment_source: {
          paypal: {
            usage_type: 'MERCHANT',
            experience_context: {
              return_url: 'https://poc-mediaopt2.frontend.site/',
              cancel_url: 'https://poc-mediaopt2.frontend.site/',
            },
          },
        },
      };
    } else if (paymentSource === 'card') {
      payloadValue = {
        payment_source: {
          card: {},
        },
      };
    }
    const payload = {
      version: version,
      actions: [
        {
          action: 'setCustomField',
          name: 'createVaultSetupTokenRequest',
          value: JSON.stringify(payloadValue),
        },
      ],
    };

    try {
      const response = await this.instance.post<{
        custom: { fields: { createVaultSetupTokenResponse: string } };
        version: number;
      }>(`/customers/${accountId}`, payload);

      const { createVaultSetupTokenResponse } = response.data.custom.fields;

      return {
        createVaultSetupTokenResponse: createVaultSetupTokenResponse,
        version: response.data.version,
      };
    } catch (error) {
      throw error;
    }
  };

  approveVaultSetupToken: (
    accountId: string,
    version: number,
    vaultSetupToken: string,
  ) => Promise<{ createPaymentTokenResponse: string; version: number }> = async (
    accountId: string,
    version: number,
    vaultSetupToken: string,
  ) => {
    const payload = {
      version: version,
      actions: [
        {
          action: 'setCustomField',
          name: 'createPaymentTokenRequest',
          value: vaultSetupToken,
        },
      ],
    };

    try {
      const response = await this.instance.post<{
        custom: { fields: { createPaymentTokenResponse: string } };
        version: number;
      }>(`/customers/${accountId}`, payload);

      const { createPaymentTokenResponse } = response.data.custom.fields;

      return {
        createPaymentTokenResponse: createPaymentTokenResponse,
        version: response.data.version,
      };
    } catch (error) {
      throw error;
    }
  };
}
