import { CurrencyPosition } from "../context/PreferencesContext";

/**
 * formats a numeric amount with the user's currency symbol.
 */
export const formatAmount = (
  amount: number,
  symbol: string,
  position: CurrencyPosition,
): string => {
  const formatted = Math.abs(amount)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  const signed = amount < 0 ? `-${formatted}` : formatted;

  return position === "before" ? `${symbol} ${signed}` : `${signed} ${symbol}`;
};
