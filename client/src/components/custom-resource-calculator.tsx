/**
 * Custom Resource Calculator Component
 * 
 * Calculates pricing for individual resources based on:
 * - Role selection (Frontend Developer, Backend Developer, etc.)
 * - Seniority level (Junior, Intermediate, Senior, Lead)
 * - Region multiplier (Euro Asia, North America, etc.)
 * - Duration (1-12 months with discounts)
 * 
 * Features:
 * - Real-time calculation with currency conversion
 * - PDF export functionality
 * - Email quote functionality
 * - Responsive design
 * - Dark/light theme support
 */

import React, { useState } from "react";
import { Settings, TrendingUp, Mail, FileText } from "lucide-react";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useCalculator } from "@/hooks/use-calculator";
import { useCurrency } from "@/hooks/use-currency";
import { useTheme } from "@/contexts/theme-context";
import { Region, Role, SeniorityLevel } from "@shared/schema";

interface CustomResourceCalculatorProps {
  onSendQuote: (quoteData: any) => void;
}

export function CustomResourceCalculator({ onSendQuote }: CustomResourceCalculatorProps) {
  const [region, setRegion] = useState("");
  const [role, setRole] = useState("");
  const [seniority, setSeniority] = useState("");
  
  const { regions, customRoles, seniorityLevels, isLoading } = useCalculator();
  const { selectedCurrency, convertFromAED, getCurrencySymbol, currencies } = useCurrency();
  const { isDarkMode } = useTheme();
  
  const calculation = useCalculator().calculateCustomRate(region, role, seniority);
  
  // Make convertedRate reactive to currency changes
  const convertedRate = React.useMemo(() => {
    // Only convert if we have currencies loaded and a valid calculation
    if (calculation.finalRate > 0 && currencies.length > 0) {
      return convertFromAED(calculation.finalRate);
    }
    return 0;
  }, [calculation.finalRate, convertFromAED, selectedCurrency, currencies.length]);

  /**
   * Handles sending quote data to email modal
   * Collects all form data and passes it to the parent component
   */
  const handleSendQuote = () => {
    if (calculation.finalRate > 0) {
      onSendQuote({
        type: 'custom',
        configuration: {
          region: regions.find((r: Region) => r.id === region)?.name,
          role: customRoles.find((r: Role) => r.id === role)?.name,
          seniority: seniorityLevels.find((s: SeniorityLevel) => s.id === seniority)?.name,
        },
        finalRate: convertedRate,
        currency: selectedCurrency,
        originalCalculation: calculation,
      });
    }
  };

  /**
   * Handles PDF export functionality
   * Creates a text-based PDF with quote details and calculation breakdown
   */
  const handleExportPDF = () => {
    if (calculation.finalRate === 0) return;
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;
      
      // Header
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Rate Card Quote', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Custom Resource Calculator', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;
      
      // Quote Details
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Quote Details:', 20, yPosition);
      yPosition += 10;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      
      const regionName = regions.find((r: Region) => r.id === region)?.name || 'Not selected';
      const roleName = customRoles.find((r: Role) => r.id === role)?.name || 'Not selected';
      const seniorityName = seniorityLevels.find((s: SeniorityLevel) => s.id === seniority)?.name || 'Not selected';
      
      pdf.text(`Region: ${regionName}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Role: ${roleName}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Seniority: ${seniorityName}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Currency: ${selectedCurrency}`, 20, yPosition);
      yPosition += 15;
      
      // Calculation Breakdown
      pdf.setFont('helvetica', 'bold');
      pdf.text('Calculation Breakdown:', 20, yPosition);
      yPosition += 10;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      
      pdf.text(`Base Rate: ${calculation.baseRate.toLocaleString()}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Regional Multiplier: ${calculation.regionalMultiplier}x`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Seniority Multiplier: ${calculation.seniorityMultiplier}x`, 25, yPosition);
      yPosition += 6;
      
      yPosition += 10;
      
      // Final Rate
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Final Monthly Rate: ${convertedRate.toLocaleString()} ${getCurrencySymbol()}`, 20, yPosition);
      yPosition += 15;
      
      // Footer
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, pageHeight - 20);
      pdf.text('Rate Card Calculator - Professional Resource Planning', pageWidth - 20, pageHeight - 20, { align: 'right' });
      
      pdf.save(`custom-resource-quote-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading calculator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
      {/* Input Panel */}
      <div className="space-y-4 sm:space-y-6">
        <Card className="bg-card border-border transition-colors duration-300 shadow-lg dark:shadow-none">
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center">
              <Settings className="text-primary mr-2 sm:mr-3" size={20} />
              Configuration
            </h2>
            
            <div className="space-y-4 sm:space-y-6">
              {/* Region Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Region</Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger data-testid="select-region" className="w-full">
                    <SelectValue placeholder="Select Region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((r: Region) => (
                      <SelectItem key={r.id} value={r.id}>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span>{r.name}</span>
                          {r.id !== "euro-asia" && (
                            <span className="text-xs text-muted-foreground sm:ml-2">
                              (+{Math.round((parseFloat(r.multiplier) - 1) * 100)}%)
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger data-testid="select-role" className="w-full">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {customRoles.map((r: Role) => (
                      <SelectItem key={r.id} value={r.id}>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span>{r.name}</span>
                          <span className="text-xs text-muted-foreground sm:ml-2">
                            ({convertFromAED(r.baseRate).toLocaleString()} {getCurrencySymbol()})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Seniority Levels */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">Seniority Level</Label>
                <RadioGroup value={seniority} onValueChange={setSeniority} className="space-y-2">
                  {seniorityLevels.map((level: SeniorityLevel) => (
                    <div key={level.id} className="relative">
                      <Label 
                        htmlFor={level.id} 
                        className="flex items-center cursor-pointer p-3 sm:p-4 border border-border rounded-lg hover:bg-accent/20 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm sm:text-base">{level.name}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                            {level.id === 'intermediate' ? 'Base Rate' : `+${Math.round((parseFloat(level.multiplier) - 1) * 100)}% Premium`} ({level.multiplier}×)
                          </div>
                        </div>
                        <RadioGroupItem 
                          value={level.id} 
                          id={level.id}
                          data-testid={`radio-seniority-${level.id}`}
                          className="ml-3 flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4"
                        />
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Panel */}
      <div className="space-y-4 sm:space-y-6">
        <div 
          className="bg-primary/10 border border-primary/20 rounded-lg p-1 shadow-lg dark:shadow-none dark:dark-mode-gradient-border" 
          style={{
            boxShadow: '0 0 30px rgba(34, 197, 94, 0.4)',
            background: isDarkMode 
              ? 'linear-gradient(135deg, hsl(142, 76%, 36%), hsl(142, 76%, 50%))' 
              : undefined,
            padding: isDarkMode ? '1px' : undefined
          }}
        >
          <Card 
            className="bg-primary border-0 shadow-lg dark:bg-transparent dark:border-0" 
            style={{
              background: isDarkMode 
                ? 'linear-gradient(145deg, hsl(0, 0%, 12%), hsl(0, 0%, 8%))' 
                : undefined,
              borderRadius: isDarkMode 
                ? 'calc(0.5rem - 1px)' 
                : undefined
            }}
          >
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-primary-foreground dark:text-foreground mb-4 flex items-center">
                <TrendingUp className="text-primary-foreground dark:text-foreground mr-2 sm:mr-3" size={18} />
                Monthly Rate Calculation
              </h3>
              
              <div className="space-y-3 sm:space-y-4">
                {/* Base Rate Display */}
                <div className="flex justify-between items-center p-3 bg-primary-foreground/10 dark:bg-muted/10 rounded-lg">
                  <span className="text-primary-foreground/80 dark:text-muted-foreground text-sm sm:text-base">Base Role Rate:</span>
                  <span className="font-mono text-sm sm:text-lg text-primary-foreground dark:text-foreground" data-testid="text-base-rate">
                    {calculation.baseRate > 0 ? `${calculation.baseRate.toLocaleString()} AED` : '--'}
                  </span>
                </div>
                
                {/* Regional Multiplier */}
                <div className="flex justify-between items-center p-3 bg-primary-foreground/10 dark:bg-muted/10 rounded-lg">
                  <span className="text-primary-foreground/80 dark:text-muted-foreground text-sm sm:text-base">Regional Multiplier:</span>
                  <span className="font-mono text-sm sm:text-lg text-primary-foreground dark:text-foreground" data-testid="text-regional-multiplier">
                    {calculation.regionalMultiplier > 0 ? `${calculation.regionalMultiplier}×` : '--'}
                  </span>
                </div>
                
                {/* Seniority Multiplier */}
                <div className="flex justify-between items-center p-3 bg-primary-foreground/10 dark:bg-muted/10 rounded-lg">
                  <span className="text-primary-foreground/80 dark:text-muted-foreground text-sm sm:text-base">Seniority Multiplier:</span>
                  <span className="font-mono text-sm sm:text-lg text-primary-foreground dark:text-foreground" data-testid="text-seniority-multiplier">
                    {calculation.seniorityMultiplier > 0 ? `${calculation.seniorityMultiplier}×` : '--'}
                  </span>
                </div>
                
                <div className="border-t border-primary-foreground/20 dark:border-border pt-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                    <span className="text-lg sm:text-xl font-bold text-primary-foreground dark:text-foreground">Final Monthly Rate:</span>
                    <div className="text-left sm:text-right">
                      <div className="text-2xl sm:text-3xl font-bold text-primary-foreground dark:text-primary" data-testid="text-final-rate">
                        {convertedRate > 0 ? `${getCurrencySymbol()}${convertedRate.toLocaleString()}` : `0 ${getCurrencySymbol()}`}
                      </div>
                      {selectedCurrency !== 'AED' && calculation.finalRate > 0 && (
                        <div className="text-xs sm:text-sm text-primary-foreground/70 dark:text-muted-foreground" data-testid="text-original-rate">
                          ≈ {calculation.finalRate.toLocaleString()} AED
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 sm:space-y-3">
          <Button 
            className="w-full text-sm sm:text-base"
            onClick={handleSendQuote}
            disabled={calculation.finalRate === 0}
            data-testid="button-send-quote"
          >
            <Mail className="mr-2" size={14} />
            <span className="hidden sm:inline">Send Quote via Email</span>
            <span className="sm:hidden">Send Quote</span>
          </Button>
          <Button 
            variant="secondary" 
            className="w-full text-sm sm:text-base"
            disabled={calculation.finalRate === 0}
            onClick={handleExportPDF}
            data-testid="button-export-pdf"
          >
            <FileText className="mr-2" size={14} />
            <span className="hidden sm:inline">Export as PDF</span>
            <span className="sm:hidden">Export PDF</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
