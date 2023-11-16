export const payPalMessagesParams = (
  placement?: 'product' | 'home' | 'category' | 'cart' | 'payment',
  amount?: number | string,
  currency?: 'EUR' | 'USD',
  layout?: 'text' | 'flex' | 'custom',
) => {
  return {
    amount: amount ?? 0,
    currency: currency ?? 'EUR',
    style: {
      layout: layout ?? 'text',
    },
    placement: placement ?? 'product',
  };
};
