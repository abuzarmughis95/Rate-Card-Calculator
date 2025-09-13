/**
 * Header Component
 * 
 * Main application header with:
 * - Theme toggle button (dark/light mode)
 * - Currency selector dropdown
 * - Responsive design for mobile and desktop
 * - Sticky positioning
 * 
 * Features:
 * - Smooth theme switching animations
 * - Real-time currency selection
 * - Mobile-optimized layout
 * - Consistent branding and styling
 */

import { Calculator, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrency } from "@/hooks/use-currency";

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export function Header({ isDarkMode, toggleDarkMode }: HeaderProps) {
  const { selectedCurrency, setSelectedCurrency, currencies, isLoading: currencyLoading } = useCurrency();

  return (
    /* 
      Use inline styles for fixed positioning to avoid CSS conflicts and ensures the header stays fixed regardless of parent styles or Tailwind overrides.
    */
    <header className="border-b border-border bg-card/95 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 transition-colors duration-300 shadow-lg dark:shadow-none" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}>
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg">
              <Calculator className="text-primary-foreground text-sm sm:text-lg" size={16} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-foreground">Rate Card Calculator</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Professional Resource Planning</p>
            </div>
            <div className="block sm:hidden">
              <h1 className="text-sm font-bold text-foreground">Rate Card</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Currency Selector */}
            <Select value={selectedCurrency} onValueChange={setSelectedCurrency} disabled={currencyLoading}>
              <SelectTrigger className="w-24" data-testid="select-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.id} value={currency.id}>
                    <div className="flex items-center space-x-2">
                      {currency.id !== 'AED' && <span>{currency.symbol}</span>}
                      <span>{currency.id}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleDarkMode}
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              data-testid="button-theme-toggle"
              className="transition-colors duration-200 hover:bg-muted/50"
            >
              {isDarkMode ? <Sun className="text-muted-foreground" size={16} /> : <Moon className="text-muted-foreground" size={16} />}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
