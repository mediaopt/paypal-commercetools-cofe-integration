import { ActionContext, Request, Response } from '@frontastic/extension-types';

import { getCurrency, getLocale } from '@Commerce-commercetools/utils/Request';
import { CartFetcher } from '@Commerce-commercetools/utils/CartFetcher';
import { CartApi } from '@Commerce-commercetools/apis/CartApi';
import { Guid } from '@Commerce-commercetools/utils/Guid';

import { Cart } from '@Types/cart/Cart';
import { PaymentStatuses } from '@Types/cart/Payment';
import { Money } from '@Types/product/Money';
import { Address } from '@Types/account/Address';
import { PaymentApi } from '../apis/PaymentApi';

import { GetUserIdTokenResponse, CreatePayPalOrderRequestBody } from '../types';

async function updateCartFromRequest(cartApi: CartApi, request: Request, actionContext: ActionContext): Promise<Cart> {
  let cart = await CartFetcher.fetchCart(cartApi, request, actionContext);

  if (request?.body === undefined || request?.body === '') {
    return cart;
  }

  const body: {
    account?: { email?: string };
    shipping?: Address;
    billing?: Address;
  } = JSON.parse(request.body);

  if (body?.account?.email !== undefined && body?.account?.email !== '') {
    cart = await cartApi.setEmail(cart, body.account.email);
  }

  if (body?.shipping !== undefined || body?.billing !== undefined) {
    const shippingAddress = body?.shipping !== undefined ? body.shipping : body.billing;
    const billingAddress = body?.billing !== undefined ? body.billing : body.shipping;

    if (shippingAddress.firstName !== '') {
      cart = await cartApi.setShippingAddress(cart, shippingAddress);
    }
    if (billingAddress.firstName !== '') {
      cart = await cartApi.setBillingAddress(cart, billingAddress);
    }
  }

  return cart;
}

export const createPayment = async (request: Request, actionContext: ActionContext) => {
  const cartApi = new CartApi(actionContext.frontasticContext, getLocale(request), getCurrency(request));
  let cart = await updateCartFromRequest(cartApi, request, actionContext);

  const requestAmountPlanned: Money = {
    currencyCode: cart.sum.currencyCode,
    centAmount: cart.sum.centAmount,
  };

  const isThereInitBraintreeSamePayment = cart.payments.some(
    (payment) =>
      payment.paymentProvider === 'PayPal' &&
      payment.paymentStatus === PaymentStatuses.INIT &&
      payment.amountPlanned.centAmount === requestAmountPlanned.centAmount,
  );

  if (!isThereInitBraintreeSamePayment) {
    cart = await cartApi.addPayment(cart, {
      id: Guid.newGuid(),
      paymentProvider: 'PayPal',
      amountPlanned: requestAmountPlanned,
      paymentStatus: PaymentStatuses.INIT,
      paymentMethod: '',
    });
  }

  const lastPaymentIndex = cart.payments.length - 1;
  const payment = cart.payments[lastPaymentIndex];
  const amountPlanned = payment.amountPlanned;
  const lineItems = cart.lineItems;
  const cartPaymentDebug = JSON.parse(cart.payments[lastPaymentIndex].debug);

  const response: Response = {
    statusCode: 200,
    body: JSON.stringify({
      id: cartPaymentDebug.id,
      version: cartPaymentDebug.version,
      lineItems,
      amountPlanned,
      cartPaymentDebug,
    }),
    sessionData: request.sessionData,
  };
  return response;
};

export const createPayPalOrder = async (request: Request, actionContext: ActionContext) => {
  const requestBody = JSON.parse(request.body) as CreatePayPalOrderRequestBody;

  const cartApi = new CartApi(actionContext.frontasticContext, getLocale(request), getCurrency(request));
  const paymentApi = new PaymentApi(actionContext.frontasticContext, getLocale(request), getCurrency(request));

  const cart = await CartFetcher.fetchCart(cartApi, request, actionContext);

  const lastPaymentIndex = cart.payments.length - 1;
  const cartPaymentDebug = JSON.parse(cart.payments[lastPaymentIndex].debug);

  const setCustomType =
    !cartPaymentDebug?.custom?.fields?.createPayPalOrderResponse && !requestBody.orderData.fraudNetSessionId;

  const paypalCart: { id: string; quantity: string }[] = [];
  cart.lineItems.map((lineItem) => {
    paypalCart.push({
      id: lineItem.productId,
      quantity: lineItem.count.toString(),
    });
  });

  const createOrderResult = await paymentApi.createOrder(
    requestBody.paymentId,
    requestBody.paymentVersion,
    setCustomType,
    requestBody.orderData,
  );

  const { paymentVersion, orderData } = createOrderResult;

  const response: Response = {
    statusCode: 200,
    body: JSON.stringify({
      orderData: JSON.parse(orderData),
      paymentVersion,
      createOrderResult,
    }),
    sessionData: request.sessionData,
  };
  return response;
};

export const capturePayPalOrder = async (request: Request, actionContext: ActionContext) => {
  const paymentApi = new PaymentApi(actionContext.frontasticContext, getLocale(request), getCurrency(request));
  const cartApi = new CartApi(actionContext.frontasticContext, getLocale(request), getCurrency(request));

  const requestBody = JSON.parse(request.body) as { paymentId: string; paymentVersion: number; orderID: string };

  const captureOrderResult = await paymentApi.captureOrder(
    requestBody.paymentId,
    requestBody.paymentVersion,
    requestBody.orderID,
  );

  const { paymentVersion, captureOrderData } = captureOrderResult;

  const cart = await CartFetcher.fetchCart(cartApi, request, actionContext);

  const response: Response = {
    statusCode: 200,
    body: JSON.stringify({
      paymentVersion,
      orderData: JSON.parse(captureOrderData),
      cart,
    }),
    sessionData: request.sessionData,
  };
  return response;
};

export const authorizePayPalOrder = async (request: Request, actionContext: ActionContext) => {
  const paymentApi = new PaymentApi(actionContext.frontasticContext, getLocale(request), getCurrency(request));
  const cartApi = new CartApi(actionContext.frontasticContext, getLocale(request), getCurrency(request));

  const requestBody = JSON.parse(request.body) as { paymentId: string; paymentVersion: number; orderID: string };

  const authorizeOrderResult = await paymentApi.authorizeOrder(
    requestBody.paymentId,
    requestBody.paymentVersion,
    requestBody.orderID,
  );

  const { paymentVersion, authorizeOrderData } = authorizeOrderResult;

  const cart = await CartFetcher.fetchCart(cartApi, request, actionContext);

  const response: Response = {
    statusCode: 200,
    body: JSON.stringify({
      paymentVersion,
      orderData: JSON.parse(authorizeOrderData),
      cart,
    }),
    sessionData: request.sessionData,
  };
  return response;
};

export const getClientToken = async (request: Request, actionContext: ActionContext) => {
  const requestBody = JSON.parse(request.body) as { paymentId: string; paymentVersion: number };
  const paymentApi = new PaymentApi(actionContext.frontasticContext, getLocale(request), getCurrency(request));

  const result = await paymentApi.getClientToken(requestBody.paymentId, requestBody.paymentVersion);

  const response: Response = {
    statusCode: 200,
    body: JSON.stringify({
      clientToken: result.clientToken,
      paymentVersion: result.paymentVersion,
    }),
    sessionData: request.sessionData,
  };
  return response;
};

export const getUserInfo = async (request: Request, actionContext: ActionContext) => {
  const accountId = request.sessionData.account?.accountId;
  const paymentApi = new PaymentApi(actionContext.frontasticContext, getLocale(request), getCurrency(request));

  let responseBody = { userIdToken: undefined, paymentTokens: undefined } as GetUserIdTokenResponse;
  if (accountId) {
    const { customerVersion } = await paymentApi.getCustomer(accountId);
    if (customerVersion) {
      const { getUserIDTokenResponse, getPaymentTokensResponse, version } = await paymentApi.getUserInfo(
        accountId,
        customerVersion,
      );
      if (getUserIDTokenResponse) {
        responseBody = {
          userIdToken: getUserIDTokenResponse,
          paymentTokens: JSON.parse(getPaymentTokensResponse ?? ''),
          version: version,
        };
      }
    }
  }

  const response: Response = {
    statusCode: 200,
    body: JSON.stringify(responseBody),
    sessionData: request.sessionData,
  };
  return response;
};

export const removePaymentToken = async (request: Request, actionContext: ActionContext) => {
  const accountId = request.sessionData.account?.accountId;
  let validationError = false;
  let paymentTokens = { payment_tokens: [] } as { payment_tokens: Array<{ id: string }> };
  const { paymentTokenId } = JSON.parse(request.body) as { paymentTokenId: string };
  let responseBody = {};

  if (!accountId) {
    validationError = true;
  } else {
    const paymentApi = new PaymentApi(actionContext.frontasticContext, getLocale(request), getCurrency(request));
    const { customerVersion } = await paymentApi.getCustomer(accountId);
    if (!customerVersion) {
      validationError = true;
    } else {
      const { getPaymentTokensResponse, version } = await paymentApi.getUserInfo(accountId, customerVersion);
      if (!getPaymentTokensResponse) {
        validationError = true;
      }

      paymentTokens = JSON.parse(getPaymentTokensResponse);
      const checkTokenExistence = paymentTokens.payment_tokens.some(
        (paymentToken) => paymentToken.id == paymentTokenId,
      );
      if (!checkTokenExistence) {
        validationError = true;
      }

      responseBody = await paymentApi.removePaymentToken(accountId, version, paymentTokenId);
    }
  }

  if (validationError) {
    return { sessionData: request.sessionData, statusCode: 400 };
  } else {
    return {
      statusCode: 200,
      body: JSON.stringify(responseBody),
      sessionData: request.sessionData,
    };
  }
};

export const createVaultSetupToken = async (request: Request, actionContext: ActionContext) => {
  const accountId = request.sessionData.account?.accountId;
  const paymentApi = new PaymentApi(actionContext.frontasticContext, getLocale(request), getCurrency(request));

  const { paymentSource } = JSON.parse(request.body) as { paymentSource: string };
  const { customerVersion } = await paymentApi.getCustomer(accountId);

  const result = await paymentApi.createVaultSetupToken(accountId, customerVersion, paymentSource);

  return {
    statusCode: 200,
    body: JSON.stringify({
      createVaultSetupTokenResponse: JSON.parse(result.createVaultSetupTokenResponse),
      version: result.version,
    }),
    sessionData: request.sessionData,
  };
};

export const approveVaultSetupToken = async (request: Request, actionContext: ActionContext) => {
  const accountId = request.sessionData.account?.accountId;
  const paymentApi = new PaymentApi(actionContext.frontasticContext, getLocale(request), getCurrency(request));

  const { vaultSetupToken } = JSON.parse(request.body) as { vaultSetupToken: string };
  const { customerVersion } = await paymentApi.getCustomer(accountId);

  const result = await paymentApi.approveVaultSetupToken(accountId, customerVersion, vaultSetupToken);

  return {
    statusCode: 200,
    body: JSON.stringify({
      createPaymentTokenResponse: JSON.parse(result.createPaymentTokenResponse),
      version: result.version,
    }),
    sessionData: request.sessionData,
  };
};
