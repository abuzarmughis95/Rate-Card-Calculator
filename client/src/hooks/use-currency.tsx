/**
 * Currency Management Hook
 * 
 * Provides currency conversion functionality and state management for:
 * - Currency selection and switching
 * - Real-time exchange rate fetching
 * - Currency conversion calculations
 * - Currency symbol display
 * 
 * Features:
 * - Live exchange rate updates from external API
 * - Two-step conversion for non-AED base currencies
 * - Automatic rate refresh when currency changes
 * - Loading states and error handling
 */

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Currency } from "@shared/schema";

interface CurrencyContextType {
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  currencies: Currency[];
  convertFromAED: (aedAmount: number) => number;
  convertToAED: (amount: number, fromCurrency: string) => number;
  getCurrencySymbol: () => string;
  getExchangeRate: () => number;
  refreshRates: () => Promise<void>;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const [selectedCurrency, setSelectedCurrency] = useState("AED");
  const [isInitialized, setIsInitialized] = useState(false);
  const queryClient = useQueryClient();

  const { data: currencyData, isLoading: currenciesLoading } = useQuery<{
    currencies: Currency[];
    baseCurrency: string;
  }>({
    queryKey: ['/api/currencies'],
    enabled: true,
  });

  const currencies = currencyData?.currencies || [];
  const currentBaseCurrency = currencyData?.baseCurrency || 'AED';

  // Set initialized when currencies are loaded
  useEffect(() => {
    if (!currenciesLoading && currencies.length > 0) {
      setIsInitialized(true);
    }
  }, [currenciesLoading, currencies]);

  // Debug: Log when selected currency changes
  useEffect(() => {
    console.log(`🔄 Currency changed to: ${selectedCurrency}`);
  }, [selectedCurrency]);

  // Auto-update exchange rates every hour
  useEffect(() => {
    const updateRates = async () => {
      try {
        await fetch('/api/currencies/update-rates', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ baseCurrency: selectedCurrency })
        });
        // Refresh currencies data
        await queryClient.invalidateQueries({ queryKey: ['/api/currencies'] });
      } catch (error) {
        console.error('Failed to update exchange rates:', error);
      }
    };

    // Update immediately
    updateRates();

    // Set up interval for hourly updates
    const interval = setInterval(updateRates, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  }, [queryClient]);

  // Update rates when currency changes (only for non-AED currencies)
  useEffect(() => {
    const updateRatesForCurrency = async () => {
      try {
        await fetch('/api/currencies/update-rates', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ baseCurrency: selectedCurrency })
        });
        await queryClient.invalidateQueries({ queryKey: ['/api/currencies'] });
      } catch (error) {
        console.error('Failed to update exchange rates for currency:', error);
      }
    };

    if (selectedCurrency !== 'AED') {
      updateRatesForCurrency();
    }
  }, [selectedCurrency, queryClient]);

  const convertFromAED = (aedAmount: number): number => {
    if (selectedCurrency === 'AED') return aedAmount;
    
    const currency = currencies.find((c: Currency) => c.id === selectedCurrency);
    if (!currency) {
      console.log(`⚠️ Currency not found: ${selectedCurrency}`);
      return aedAmount;
    }
    
    console.log(`💱 Converting ${aedAmount} AED to ${selectedCurrency} (rate: ${currency.rate}, base: ${currentBaseCurrency})`);
    
    if (currentBaseCurrency === 'AED') {
      // If AED is the base, use direct conversion
      const result = Math.round(aedAmount * parseFloat(currency.rate));
      console.log(`✅ Direct conversion result: ${result}`);
      return result;
    } else {
      // If another currency is the base, we need to convert differently
      // The stored rate is now "how many of selectedCurrency per 1 baseCurrency"
      // We need to convert AED to base currency first, then to selected currency
      const baseCurrencyData = currencies.find(c => c.id === currentBaseCurrency);
      if (!baseCurrencyData) return aedAmount;
      
      // Convert AED to base currency
      const aedToBaseRate = 1 / parseFloat(baseCurrencyData.rate);
      const baseAmount = aedAmount * aedToBaseRate;
      
      // Convert base currency to selected currency
      const result = Math.round(baseAmount * parseFloat(currency.rate));
      console.log(`✅ Two-step conversion result: ${result}`);
      return result;
    }
  };

  const convertToAED = (amount: number, fromCurrency: string): number => {
    if (fromCurrency === 'AED') return amount;
    
    const currency = currencies.find((c: Currency) => c.id === fromCurrency);
    if (!currency) return amount;
    
    return Math.round(amount / parseFloat(currency.rate));
  };

  const getCurrencySymbol = (): string => {
    if (selectedCurrency === 'AED') return 'AED';
    const currency = currencies.find((c: Currency) => c.id === selectedCurrency);
    return currency?.symbol || selectedCurrency;
  };

  const getExchangeRate = (): number => {
    const currency = currencies.find((c: Currency) => c.id === selectedCurrency);
    return currency ? parseFloat(currency.rate) : 1;
  };

  const refreshRates = async (): Promise<void> => {
    try {
      await fetch('/api/currencies/update-rates', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseCurrency: selectedCurrency })
      });
      await queryClient.invalidateQueries({ queryKey: ['/api/currencies'] });
    } catch (error) {
      console.error('Failed to refresh exchange rates:', error);
    }
  };

  const value = {
    selectedCurrency,
    setSelectedCurrency,
    currencies,
    convertFromAED,
    convertToAED,
    getCurrencySymbol,
    getExchangeRate,
    refreshRates,
    isLoading: currenciesLoading || !isInitialized,
  };

  // Don't render children until initialized
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    console.error('useCurrency must be used within a CurrencyProvider');
    // Return a default context to prevent crashes during initialization
    return {
      selectedCurrency: 'AED',
      setSelectedCurrency: () => {},
      currencies: [],
      convertFromAED: (amount: number) => amount,
      convertToAED: (amount: number, fromCurrency: string) => amount,
      getCurrencySymbol: () => 'AED',
      getExchangeRate: () => 1,
      refreshRates: async () => {},
      isLoading: true,
    };
  }
  return context;
}
