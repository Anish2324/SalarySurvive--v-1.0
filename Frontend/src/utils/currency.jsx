/**
 * currency.jsx — shared currency utilities used across all pages.
 *
 * Usage:
 *   import { CURRENCIES, formatCurrency, useCurrency } from "../utils/currency";
 *
 *   const { currency, setCurrency, exchangeRate, rateLoading } = useCurrency();
 *   formatCurrency(1500, currency, exchangeRate)  // "£18.02" etc.
 */

import { useState, useEffect } from "react";

/* ────────────────────────────────────────────────────────────── */
/*  SUPPORTED CURRENCIES                                          */
/* ────────────────────────────────────────────────────────────── */

export const CURRENCIES = {
  INR: { locale: "en-IN", symbol: "₹"  },
  USD: { locale: "en-US", symbol: "$"  },
  EUR: { locale: "de-DE", symbol: "€"  },
  GBP: { locale: "en-GB", symbol: "£"  },
  JPY: { locale: "ja-JP", symbol: "¥"  },
  AUD: { locale: "en-AU", symbol: "A$" },
  CAD: { locale: "en-CA", symbol: "C$" },
};

/* ────────────────────────────────────────────────────────────── */
/*  FORMAT FUNCTION                                               */
/* ────────────────────────────────────────────────────────────── */

/**
 * Formats a numeric value as a currency string.
 *
 * @param {number} value    - The raw INR amount stored in the database.
 * @param {string} currency - One of the keys in CURRENCIES (default "INR").
 * @param {number} rate     - Live exchange rate from INR → currency (default 1).
 * @returns {string}        - Formatted string e.g. "₹50,000" or "$602.00".
 *
 * @example
 * formatCurrency(50000)              // "₹50,000"
 * formatCurrency(50000, "USD", 0.012) // "$600.00"
 */
export function formatCurrency(value, currency = "INR", rate = 1) {
  const { locale } = CURRENCIES[currency] ?? CURRENCIES.INR;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: currency === "JPY" ? 0 : 2,
  }).format(value * rate);
}

/* ────────────────────────────────────────────────────────────── */
/*  HOOK — manages currency state + live exchange rate fetch      */
/* ────────────────────────────────────────────────────────────── */

/**
 * React hook that provides:
 *   currency      – currently selected currency code (e.g. "USD")
 *   setCurrency   – setter to change the selected currency
 *   exchangeRate  – live INR → currency rate fetched from Frankfurter API
 *   rateLoading   – true while the rate is being fetched
 *
 * Exchange rates are fetched from https://api.frankfurter.app (free, no API key).
 * Defaults to INR with rate = 1 (no conversion needed).
 */
export function useCurrency() {
  const [currency, setCurrency] = useState("INR");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [rateLoading, setRateLoading] = useState(false);

  useEffect(() => {
    if (currency === "INR") {
      setExchangeRate(1);
      return;
    }
    setRateLoading(true);
    fetch(`https://api.frankfurter.app/latest?from=INR&to=${currency}`)
      .then((r) => r.json())
      .then((data) => setExchangeRate(data.rates?.[currency] ?? 1))
      .catch(() => setExchangeRate(1))
      .finally(() => setRateLoading(false));
  }, [currency]);

  return { currency, setCurrency, exchangeRate, rateLoading };
}

/* ────────────────────────────────────────────────────────────── */
/*  CURRENCY SELECTOR COMPONENT                                   */
/* ────────────────────────────────────────────────────────────── */

/**
 * Drop-in currency picker component.
 *
 * Props:
 *   currency      – current value (controlled)
 *   onChange      – setter function e.g. setCurrency
 *   rateLoading   – shows "Fetching rate…" indicator while true
 *
 * @example
 * <CurrencySelector currency={currency} onChange={setCurrency} rateLoading={rateLoading} />
 */
export function CurrencySelector({ currency, onChange, rateLoading = false }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <select
          value={currency}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none h-9 pl-3 pr-8 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer hover:border-slate-300 dark:hover:border-slate-500 transition focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
        >
          {Object.entries(CURRENCIES).map(([code, { symbol }]) => (
            <option key={code} value={code}>
              {symbol} {code}
            </option>
          ))}
        </select>
        {/* Chevron — inline SVG so this file has zero icon-library imports */}
        <svg
          className="size-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.085l3.71-3.855a.75.75 0 111.08 1.04l-4.25 4.42a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      {rateLoading && (
        <span className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap animate-pulse">
          Fetching rate…
        </span>
      )}
    </div>
  );
}
