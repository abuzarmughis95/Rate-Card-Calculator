import React, { useState } from "react";
import { Users, Calculator, Mail, FileText } from "lucide-react";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useCalculator } from "@/hooks/use-calculator";
import { useCurrency } from "@/hooks/use-currency";
import { useTheme } from "@/contexts/theme-context";

interface SWATTeamCalculatorProps {
  onSendQuote: (quoteData: any) => void;
}

export function SWATTeamCalculator({ onSendQuote }: SWATTeamCalculatorProps) {
  const [role, setRole] = useState("");
  const [workload, setWorkload] = useState("");
  const [duration, setDuration] = useState("");
  const [seniority, setSeniority] = useState("");
  
  const { swatRoles, seniorityLevels, workloadOptions, durationOptions, isLoading } = useCalculator();
  const { selectedCurrency, convertFromAED, getCurrencySymbol, currencies } = useCurrency();
  const { isDarkMode } = useTheme();
  
  const calculation = useCalculator().calculateSWATRate(role, workload, duration, seniority);
  
  // Make convertedRate reactive to currency changes
  const convertedRate = React.useMemo(() => {
    // Only convert if we have currencies loaded and a valid calculation
    if (calculation.finalRate > 0 && currencies.length > 0) {
      return convertFromAED(calculation.finalRate);
    }
    return 0;
  }, [calculation.finalRate, convertFromAED, selectedCurrency, currencies.length]);

  const getDurationDiscount = (value: string) => {
    const duration = parseInt(value);
    if (duration === 1) return "No Discount";
    if (duration === 2) return "-5% Discount";
    if (duration === 3) return "-10% Discount";
    if (duration >= 4) return "-15% Discount";
    return "No Discount";
  };

  const getWorkloadDaysPerWeek = (percentage: string) => {
    const percent = parseInt(percentage);
    const days = Math.round((percent / 100) * 5); // 5 working days per week
    return `${days} day${days !== 1 ? 's' : ''}/week`;
  };


  const handleSendQuote = () => {
    if (calculation.finalRate > 0) {
      onSendQuote({
        type: 'swat',
        configuration: {
          role: swatRoles.find((r: any) => r.id === role)?.name,
          workload: workload,
          duration: duration,
          seniority: seniorityLevels.find((s: any) => s.id === seniority)?.name,
        },
        finalRate: convertedRate,
        currency: selectedCurrency,
        originalCalculation: calculation,
      });
    }
  };

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
      pdf.text('SWAT Team Calculator', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;
      
      // Quote Details
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Quote Details:', 20, yPosition);
      yPosition += 10;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      
      const roleName = swatRoles.find((r: any) => r.id === role)?.name || 'Not selected';
      const seniorityName = seniorityLevels.find((s: any) => s.id === seniority)?.name || 'Not selected';
      const durationLabel = durationOptions.find(d => d.value === duration)?.label || 'Not selected';
      
      pdf.text(`Role: ${roleName}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Workload: ${workload}%`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Duration: ${durationLabel}`, 20, yPosition);
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
      pdf.text(`Base with Seniority: ${calculation.baseWithSeniority.toLocaleString()}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`After Workload (${workload}%): ${calculation.afterWorkload.toLocaleString()}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Duration Discount: ${calculation.durationDiscount.toLocaleString()}`, 25, yPosition);
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
      
      pdf.save(`swat-team-quote-${new Date().toISOString().split('T')[0]}.pdf`);
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
              <Users className="text-primary mr-2 sm:mr-3" size={20} />
              <span className="hidden sm:inline">SWAT Team Configuration</span>
              <span className="sm:hidden">SWAT Team</span>
            </h2>
            
            <div className="space-y-4 sm:space-y-6">
              {/* Role Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger data-testid="select-swat-role" className="w-full">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {swatRoles.map((r: any) => (
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

              {/* Workload Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">Workload</Label>
                <RadioGroup value={workload} onValueChange={setWorkload}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {workloadOptions.map((option) => (
                      <div key={option.value} className="relative">
                        <Label 
                          htmlFor={`workload-${option.value}`}
                          className="flex items-center cursor-pointer p-3 sm:p-4 border border-border rounded-lg hover:bg-accent/20 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm sm:text-base">{option.label}</div>
                            <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                              {option.value}% • {getWorkloadDaysPerWeek(option.value)}
                            </div>
                          </div>
                          <RadioGroupItem 
                            value={option.value} 
                            id={`workload-${option.value}`}
                            data-testid={`radio-workload-${option.value}`}
                            className="ml-3 flex-shrink-0 w-2 h-2 sm:w-4 sm:h-4"
                          />
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Duration Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger data-testid="select-duration" className="w-full">
                    <SelectValue placeholder="Select Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground sm:ml-2">
                            ({getDurationDiscount(option.value)})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Seniority for SWAT */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">Seniority Level</Label>
                <RadioGroup value={seniority} onValueChange={setSeniority} className="space-y-2">
                  {seniorityLevels.map((level: any) => (
                    <div key={level.id} className="relative">
                      <Label 
                        htmlFor={`swat-${level.id}`}
                        className="flex items-center cursor-pointer p-3 sm:p-4 border border-border rounded-lg hover:bg-accent/20 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm sm:text-base">{level.name} ({level.multiplier}×)</div>
                        </div>
                        <RadioGroupItem 
                          value={level.id} 
                          id={`swat-${level.id}`}
                          data-testid={`radio-swat-seniority-${level.id}`}
                          className="ml-3 flex-shrink-0 w-2 h-2 sm:w-4 sm:h-4"
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
                <Calculator className="text-primary-foreground dark:text-foreground mr-2 sm:mr-3" size={18} />
                <span className="hidden sm:inline">SWAT Team Rate Calculation</span>
                <span className="sm:hidden">SWAT Rate</span>
              </h3>
              
              <div className="space-y-3 sm:space-y-4">
                {/* Base Calculation */}
                <div className="flex justify-between items-center p-3 bg-primary-foreground/10 dark:bg-muted/10 rounded-lg">
                  <span className="text-primary-foreground/80 dark:text-muted-foreground text-sm sm:text-base">Base Rate × Seniority:</span>
                  <span className="font-mono text-sm sm:text-lg text-primary-foreground dark:text-foreground" data-testid="text-swat-base-calculation">
                    {calculation.baseWithSeniority > 0 ? `${calculation.baseWithSeniority.toLocaleString()} AED` : '--'}
                  </span>
                </div>
                
                {/* Workload Applied */}
                <div className="flex justify-between items-center p-3 bg-primary-foreground/10 dark:bg-muted/10 rounded-lg">
                  <span className="text-primary-foreground/80 dark:text-muted-foreground text-sm sm:text-base">Workload Applied:</span>
                  <span className="font-mono text-sm sm:text-lg text-primary-foreground dark:text-foreground" data-testid="text-workload-applied">
                    {calculation.afterWorkload > 0 ? `${calculation.afterWorkload.toLocaleString()} AED` : '--'}
                  </span>
                </div>
                
                {/* Duration Discount */}
                <div className="flex justify-between items-center p-3 bg-primary-foreground/10 dark:bg-muted/10 rounded-lg">
                  <span className="text-primary-foreground/80 dark:text-muted-foreground text-sm sm:text-base">Duration Discount:</span>
                  <span className="font-mono text-sm sm:text-lg text-primary-foreground dark:text-foreground" data-testid="text-duration-discount">
                    {calculation.durationDiscount > 0 ? `-${calculation.durationDiscount}%` : '--'}
                  </span>
                </div>
                
                {/* Pre-negotiated Discount */}
                <div className="flex justify-between items-center p-3 bg-destructive/20 dark:bg-destructive/10 rounded-lg border border-destructive/30 dark:border-destructive/20">
                  <span className="text-primary-foreground/80 dark:text-muted-foreground text-sm sm:text-base">SWAT Discount:</span>
                  <span className="font-mono text-sm sm:text-lg text-destructive-foreground dark:text-destructive" data-testid="text-swat-discount">-20%</span>
                </div>
                
                <div className="border-t border-primary-foreground/20 dark:border-border pt-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                    <span className="text-lg sm:text-xl font-bold text-primary-foreground dark:text-foreground">Final Monthly Rate:</span>
                    <div className="text-left sm:text-right">
                      <div className="text-2xl sm:text-3xl font-bold text-primary-foreground dark:text-primary" data-testid="text-swat-final-rate">
                        {convertedRate > 0 ? `${getCurrencySymbol()}${convertedRate.toLocaleString()}` : `0 ${getCurrencySymbol()}`}
                      </div>
                      {selectedCurrency !== 'AED' && calculation.finalRate > 0 && (
                        <div className="text-xs sm:text-sm text-primary-foreground/70 dark:text-muted-foreground" data-testid="text-swat-original-rate">
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
            data-testid="button-send-swat-quote"
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
            data-testid="button-export-swat-pdf"
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
