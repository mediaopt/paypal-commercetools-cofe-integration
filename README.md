# PayPal CoFe Integration Example

In this repository, you can find an example how we integrated [paypal-commercetools-client](https://www.npmjs.com/package/paypal-commercetools-client) and [paypal-commercetools-connector](https://github.com/mediaopt/paypal-commercetools-connector) in CoFe.  **This is not a standalone application**, we only show here the changes that we applied to commercetools frontend to integrate with the PayPal connector. 

The working demo of te integration can be seen at [https://poc-mediaopt2.frontend.site/](https://poc-mediaopt2.frontend.site/).

For installation and usage of the commercetools frontend please refer to [commercetools official documentation](https://commercetools.com/products/frontend). For installation and usage of the PayPal connector and client please refer to the [paypal-commercetools-client](https://www.npmjs.com/package/paypal-commercetools-client) and [paypal-commercetools-connector](https://github.com/mediaopt/paypal-commercetools-connector) documentation.

## Project structure

This project strictly follows the folder structure of the commercetools frontend. The client is installed at the frontend (client side) via npm and the API required for its functioning are developed at the backend (server side). The developed API communicates the commercetools. Please see also the [Architecture diagram of the connector](https://github.com/mediaopt/paypal-commercetools-connector/blob/main/docs/Architecture.pdf).

The most important changes at the frontend are:
1) at the [actions](./packages/poc/frontend/frontastic/actions) the actions were developed to communicate with commercetools backend and through it with commercetools and connector (see also [commercetools Frontend API's documentation](https://docs.commercetools.com/frontend-api/action).
2) at the [provider](./packages/poc/frontend/frontastic/provider) the content providers for PayPal payment and settings were developed.
3) at the [components](./packages/poc/frontend/components) several components and helpers were developed or modified to properly process the PayPal payments and host PayPal client components.

At the backend were added:
1) in [actionControllers](./packages/poc/backend/payment-paypal/actionControllers) the controllers PayPalController and SettingsController were developed. They are responsible for properly handle the requests from the frontend and prepare the required data to communicate with the connector.
2) in [apis](./packages/poc/backend/payment-paypal/apis) the PaymentApi and SettingsApi were developed. These API obtain the data from the corresponding controller and actually communicate with commercetools.
