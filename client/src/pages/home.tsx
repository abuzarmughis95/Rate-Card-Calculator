/**
 * Home Page Component
 * 
 * Main application page that provides a tabbed interface for two different rate calculators:
 * 1. Custom Resource Calculator - For individual resource pricing
 * 2. SWAT Team Calculator - For team-based pricing with workload options
 * 
 * Features:
 * - Tab switching with smooth animations (left-to-right, right-to-left)
 * - Theme support (dark/light mode)
 * - Email quote functionality
 * - Responsive design for mobile and desktop
 */

import { useState } from "react";
import { Settings, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomResourceCalculator } from "@/components/custom-resource-calculator";
import { SWATTeamCalculator } from "@/components/swat-team-calculator";
import { EmailQuoteModal } from "@/components/email-quote-modal";
import { Header } from "@/layout/header";
import { useCurrency } from "@/hooks/use-currency";
import { useTheme } from "@/contexts/theme-context";

export default function Home() {
  const [activeCalculator, setActiveCalculator] = useState<'custom' | 'swat'>('custom');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailQuoteData, setEmailQuoteData] = useState<any>(null);
  const { isDarkMode, toggleTheme, isLoading } = useTheme();
  const { getCurrencySymbol } = useCurrency();

  /**
   * Handles sending quote data to email modal
   * @param quoteData - The calculated quote data from the calculator
   */
  const handleSendQuote = (quoteData: any) => {
    setEmailQuoteData(quoteData);
    setIsEmailModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground polka-dot-bg mt-16">
      {/* Header */}
      <Header isDarkMode={isDarkMode} toggleDarkMode={toggleTheme} />

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Calculator Tabs */}
        <div className="mb-6 sm:mb-8">
          <div className="relative flex space-x-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-full p-1 w-full max-w-2xl mx-auto shadow-lg">
            {/* Sliding indicator */}
            <div 
              className={`absolute top-1 bottom-1 bg-primary rounded-full transition-all duration-300 ease-in-out shadow-lg border border-primary/20 ${
                activeCalculator === 'custom' 
                  ? 'left-1 right-1/2' 
                  : 'left-1/2 right-1'
              }`}
            />
            
            <Button
              variant="ghost"
              className={`relative z-10 flex-1 transition-all duration-300 text-sm sm:text-base rounded-full py-3 px-6 ${
                activeCalculator === 'custom' 
                  ? 'text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
              onClick={() => setActiveCalculator('custom')}
              data-testid="tab-custom-resource"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
              <span className="hidden sm:inline">Custom Resource</span>
              <span className="sm:hidden">Custom</span>
            </Button>
            <Button
              variant="ghost"
              className={`relative z-10 flex-1 transition-all duration-300 text-sm sm:text-base rounded-full py-3 px-6 ${
                activeCalculator === 'swat' 
                  ? 'text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
              onClick={() => setActiveCalculator('swat')}
              data-testid="tab-swat-team"
            >
              <Calculator className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
              <span className="hidden sm:inline">SWAT Team</span>
              <span className="sm:hidden">SWAT</span>
            </Button>
          </div>
        </div>

        {/* Calculator Content */}
        <div className="relative overflow-hidden">
          <div 
            className={`transition-all duration-500 ease-in-out ${
              activeCalculator === 'custom' 
                ? 'translate-x-0 opacity-100' 
                : 'translate-x-[-100%] opacity-0 absolute inset-0'
            }`}
          >
            <CustomResourceCalculator onSendQuote={handleSendQuote} />
          </div>
          <div 
            className={`transition-all duration-500 ease-in-out ${
              activeCalculator === 'swat' 
                ? 'translate-x-0 opacity-100' 
                : 'translate-x-[100%] opacity-0 absolute inset-0'
            }`}
          >
            <SWATTeamCalculator onSendQuote={handleSendQuote} />
          </div>
        </div>
      </main>

      {/* Email Quote Modal */}
      <EmailQuoteModal 
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        quoteData={emailQuoteData}
      />
    </div>
  );
}
