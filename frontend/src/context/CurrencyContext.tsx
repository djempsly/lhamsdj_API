"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { getCurrencies, detectCurrency, type Currency } from "@/services/currencyService";

interface CurrencyContextValue {
  currency: { code: string; symbol: string; rate: number };
  currencies: Currency[];
  setCurrency: (code: string) => void;
  formatPrice: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: { code: "USD", symbol: "$", rate: 1 },
  currencies: [],
  setCurrency: () => {},
  formatPrice: (a) => `$${a.toFixed(2)}`,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [currency, setCurrencyState] = useState({ code: "USD", symbol: "$", rate: 1 });

  useEffect(() => {
    // Restore from localStorage
    try {
      const saved = localStorage.getItem("lhams_currency");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.code) setCurrencyState(parsed);
      }
    } catch { /* empty */ }

    // Fetch available currencies
    getCurrencies().then((res) => {
      if (res.success && Array.isArray(res.data)) {
        setCurrencies(res.data);
      }
    });

    // Detect user currency from browser locale
    try {
      const locale = navigator.language || "en-US";
      const countryCode = locale.split("-")[1] || "US";
      detectCurrency(countryCode).then((res) => {
        if (res.success && res.data) {
          const saved = localStorage.getItem("lhams_currency");
          if (!saved) {
            const detected = { code: res.data.currency, symbol: res.data.symbol, rate: res.data.rate };
            setCurrencyState(detected);
            localStorage.setItem("lhams_currency", JSON.stringify(detected));
          }
        }
      });
    } catch { /* empty */ }
  }, []);

  const setCurrency = useCallback((code: string) => {
    const found = currencies.find((c) => c.code === code);
    if (found) {
      const next = { code: found.code, symbol: found.symbol, rate: found.rate };
      setCurrencyState(next);
      localStorage.setItem("lhams_currency", JSON.stringify(next));
    }
  }, [currencies]);

  const formatPrice = useCallback((amount: number) => {
    const converted = amount * currency.rate;
    return `${currency.symbol}${converted.toFixed(2)}`;
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, currencies, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
