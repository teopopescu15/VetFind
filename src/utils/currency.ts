/**
 * Currency Formatting Utilities
 * Formats prices to Romanian currency (RON)
 */

export const formatPrice = (price: number | string | null | undefined): string => {
  if (price == null) return '0 RON';
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return `${numPrice.toFixed(0)} RON`;
};

export const formatPriceRange = (
  min?: number | string | null,
  max?: number | string | null
): string => {
  if (!min && !max) return 'Contactați pentru preț';

  const minNum = min ? (typeof min === 'string' ? parseFloat(min) : min) : 0;
  const maxNum = max ? (typeof max === 'string' ? parseFloat(max) : max) : minNum;

  if (minNum === maxNum) return formatPrice(minNum);
  return `${minNum.toFixed(0)} - ${maxNum.toFixed(0)} RON`;
};
