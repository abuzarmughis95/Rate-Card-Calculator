/**
 * Calculator Data Management Hook
 * 
 * Provides data fetching and calculation functionality for:
 * - Regions, roles, seniority levels, and calculator options
 * - Rate calculations for both custom and SWAT team calculators
 * - Dynamic workload and duration options
 * 
 * Features:
 * - Real-time data fetching from backend APIs
 * - Rate calculation with multipliers and discounts
 * - Support for both individual and team-based pricing
 * - Loading states and error handling
 */

import { useQuery } from "@tanstack/react-query";
import type { Region, Role, SeniorityLevel } from "@shared/schema";

interface Option {
  id: string;
  label: string;
  value: string;
}

export function useCalculator() {
  const { data: regions = [], isLoading: regionsLoading } = useQuery<Region[]>({
    queryKey: ['/api/regions'],
  });

  const { data: customRoles = [], isLoading: customRolesLoading } = useQuery<Role[]>({
    queryKey: ['/api/roles/custom'],
  });

  const { data: swatRoles = [], isLoading: swatRolesLoading } = useQuery<Role[]>({
    queryKey: ['/api/roles/swat'],
  });

  const { data: seniorityLevels = [], isLoading: seniorityLoading } = useQuery<SeniorityLevel[]>({
    queryKey: ['/api/seniority-levels'],
  });

  const { data: calculatorOptions, isLoading: optionsLoading } = useQuery<{
    workloadOptions: Option[];
    durationOptions: Option[];
  }>({
    queryKey: ['/api/calculator-options'],
  });

  const workloadOptions = calculatorOptions?.workloadOptions || [];
  const durationOptions = calculatorOptions?.durationOptions || [];

  const isLoading = regionsLoading || customRolesLoading || swatRolesLoading || seniorityLoading || optionsLoading;

  const calculateCustomRate = (regionId: string, roleId: string, seniorityId: string) => {
    const region = regions.find(r => r.id === regionId);
    const role = customRoles.find(r => r.id === roleId);
    const seniority = seniorityLevels.find(s => s.id === seniorityId);

    if (!region || !role || !seniority) {
      return {
        baseRate: 0,
        regionalMultiplier: 0,
        seniorityMultiplier: 0,
        finalRate: 0,
      };
    }

    const baseRate = role.baseRate;
    const regionalMultiplier = parseFloat(region.multiplier);
    const seniorityMultiplier = parseFloat(seniority.multiplier);
    const finalRate = Math.round(baseRate * regionalMultiplier * seniorityMultiplier);

    return {
      baseRate,
      regionalMultiplier,
      seniorityMultiplier,
      finalRate,
    };
  };

  const calculateSWATRate = (roleId: string, workloadPercent: string, durationMonths: string, seniorityId: string) => {
    const role = swatRoles.find(r => r.id === roleId);
    const seniority = seniorityLevels.find(s => s.id === seniorityId);

    if (!role || !seniority || !workloadPercent || !durationMonths) {
      return {
        baseRate: 0,
        baseWithSeniority: 0,
        afterWorkload: 0,
        durationDiscount: 0,
        finalRate: 0,
      };
    }

    const baseRate = role.baseRate;
    const seniorityMultiplier = parseFloat(seniority.multiplier);
    const workload = parseInt(workloadPercent) / 100;
    const duration = parseInt(durationMonths);

    // Calculate base rate with seniority
    const baseWithSeniority = Math.round(baseRate * seniorityMultiplier);

    // Apply workload percentage
    const afterWorkload = Math.round(baseWithSeniority * workload);

    // Apply duration discount
    let durationDiscount = 0;
    if (duration === 2) durationDiscount = 5;
    else if (duration === 3) durationDiscount = 10;
    else if (duration >= 4) durationDiscount = 15;

    const afterDurationDiscount = Math.round(afterWorkload * (1 - durationDiscount / 100));

    // Apply pre-negotiated SWAT discount (20%)
    const finalRate = Math.round(afterDurationDiscount * 0.8);

    return {
      baseRate,
      baseWithSeniority,
      afterWorkload,
      durationDiscount,
      finalRate,
    };
  };

  return {
    regions,
    customRoles,
    swatRoles,
    seniorityLevels,
    workloadOptions,
    durationOptions,
    isLoading,
    calculateCustomRate,
    calculateSWATRate,
  };
}
