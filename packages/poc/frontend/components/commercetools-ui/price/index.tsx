import { Money } from '@Types/product/Money';
import Typography from 'components/commercetools-ui/typography';
import { CurrencyHelpers } from 'helpers/currencyHelpers';

export interface PriceProps {
  price: Money;
  className?: string;
}

const Price: React.FC<PriceProps> = ({ price: { currencyCode = 'EUR', ...price }, className }) => {
  return (
    <span className={className || 'mt-1 text-sm font-medium text-gray-900 dark:text-light-100'}>
      <Typography>{CurrencyHelpers.formatForCurrency(price)}</Typography>
    </span>
  );
};

export default Price;
