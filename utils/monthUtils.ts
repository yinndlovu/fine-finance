import { format, addMonths, subMonths, parseISO, startOfMonth } from "date-fns";

/** returns a "YYYY-MM" string for any date */
export const toMonthKey = (date: Date): string => format(date, "yyyy-MM");

/** parses a "YYYY-MM" key back into a date (first of that month) */
export const fromMonthKey = (key: string): Date =>
  startOfMonth(parseISO(`${key}-01`));

/** returns the "YYYY-MM" key for the month after the given key */
export const nextMonthKey = (key: string): string =>
  toMonthKey(addMonths(fromMonthKey(key), 1));

/** returns the "YYYY-MM" key for the month before the given key */
export const prevMonthKey = (key: string): string =>
  toMonthKey(subMonths(fromMonthKey(key), 1));

/** human-readable label, e.g. "June 2026" */
export const monthLabel = (key: string): string =>
  format(fromMonthKey(key), "MMMM yyyy");

/** true when the key is the current calendar month */
export const isCurrentMonth = (key: string): boolean =>
  key === toMonthKey(new Date());

/** true when the key is in the future relative to today */
export const isFutureMonth = (key: string): boolean =>
  key > toMonthKey(new Date());
