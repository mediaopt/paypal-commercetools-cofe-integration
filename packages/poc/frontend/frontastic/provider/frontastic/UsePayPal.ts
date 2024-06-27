export interface UsePayPal {
  getSettings: () => Promise<GetPayPalSettingsResponse>;
  updateOrderOnShippingChange: () => Promise<UpdateOrderOnShippingChangeResponse>;
  captureOrder: (paymentId: string, version: number, orderID?: string) => Promise<captureOrderResponse>;
}

export type GetPayPalSettingsResponse = {
  acceptPayLater?: boolean;
  acceptCredit?: boolean;
};

export type UpdateOrderOnShippingChangeResponse = {
  updateOrderPrice: { status: string };
  paymentVersion: number;
};

export type captureOrderResponse = {
  paymentVersion: number;
  orderData: {
    id: string;
    intent: string;
    status: string;
    payer: {
      email_address: string;
      name: {
        given_name: string;
        surname: string;
      };
    };
  };
  cart: {
    shippingAddress: {
      streetName: string;
      streetNumber: string;
      city: string;
      country: string;
      postalCode: string;
    };
    email: string;
    firstName: string;
    lastName: string;
  };
};
