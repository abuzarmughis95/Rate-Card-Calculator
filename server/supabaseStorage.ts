import { createClient } from '@supabase/supabase-js';
import { type Region, type Role, type SeniorityLevel, type Currency, type Quote, type InsertQuote } from "@shared/schema";
import { randomUUID } from "crypto";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables must be set");
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export class SupabaseStorage {
  // Regions
  async getRegions(): Promise<Region[]> {
    const { data, error } = await supabase
      .from('kv_store_f150aa0f')
      .select('value')
      .eq('key', 'regions')
      .single();
    
    if (error) {
      console.error('Error fetching regions:', error);
      return [];
    }
    
    return data?.value || [];
  }

  // Roles
  async getRoles(): Promise<Role[]> {
    const { data, error } = await supabase
      .from('kv_store_f150aa0f')
      .select('value')
      .eq('key', 'roles')
      .single();
    
    if (error) {
      console.error('Error fetching roles:', error);
      return [];
    }
    
    return data?.value || [];
  }

  async getRolesByCategory(category: string): Promise<Role[]> {
    const roles = await this.getRoles();
    return roles.filter(role => role.category === category);
  }

  // Seniority Levels
  async getSeniorityLevels(): Promise<SeniorityLevel[]> {
    const { data, error } = await supabase
      .from('kv_store_f150aa0f')
      .select('value')
      .eq('key', 'seniority_levels')
      .single();
    
    if (error) {
      console.error('Error fetching seniority levels:', error);
      return [];
    }
    
    return data?.value || [];
  }

  // Currencies
  async getCurrencies(): Promise<Currency[]> {
    const { data, error } = await supabase
      .from('kv_store_f150aa0f')
      .select('value')
      .eq('key', 'currencies')
      .single();
    
    if (error) {
      console.error('Error fetching currencies:', error);
      return [];
    }
    
    return data?.value || [];
  }

  async updateCurrencyRates(rates: { [key: string]: number }, baseCurrency: string = 'AED'): Promise<void> {
    const currencies = await this.getCurrencies();
    const updatedCurrencies = currencies.map(currency => ({
      ...currency,
      rate: rates[currency.id] || currency.rate,
      // All currencies now have the same base currency context
      baseCurrency: baseCurrency
    }));

    // Also store the current base currency separately
    const { error: currenciesError } = await supabase
      .from('kv_store_f150aa0f')
      .upsert({
        key: 'currencies',
        value: updatedCurrencies
      });

    const { error: baseCurrencyError } = await supabase
      .from('kv_store_f150aa0f')
      .upsert({
        key: 'current_base_currency',
        value: baseCurrency
      });

    if (currenciesError || baseCurrencyError) {
      console.error('Error updating currency rates:', currenciesError || baseCurrencyError);
      throw new Error('Failed to update currency rates');
    }
  }

  // Get current base currency
  async getCurrentBaseCurrency(): Promise<string> {
    const { data, error } = await supabase
      .from('kv_store_f150aa0f')
      .select('value')
      .eq('key', 'current_base_currency')
      .single();
    
    if (error) {
      console.error('Error fetching current base currency:', error);
      return 'AED'; // Default to AED
    }
    
    return data?.value || 'AED';
  }

  // Workload options
  async getWorkloadOptions(): Promise<{ id: string; label: string; value: string }[]> {
    const { data, error } = await supabase
      .from('kv_store_f150aa0f')
      .select('value')
      .eq('key', 'workload_options')
      .single();
    
    if (error) {
      console.error('Error fetching workload options:', error);
      return [
        { id: '25', label: '25%', value: '25' },
        { id: '50', label: '50%', value: '50' },
        { id: '75', label: '75%', value: '75' },
        { id: '100', label: '100%', value: '100' }
      ];
    }
    
    return data?.value || [];
  }

  // Duration options
  async getDurationOptions(): Promise<{ id: string; label: string; value: string }[]> {
    const { data, error } = await supabase
      .from('kv_store_f150aa0f')
      .select('value')
      .eq('key', 'duration_options')
      .single();
    
    if (error) {
      console.error('Error fetching duration options:', error);
      return [
        { id: '1', label: '1 Month', value: '1' },
        { id: '2', label: '2 Months', value: '2' },
        { id: '3', label: '3 Months', value: '3' },
        { id: '4', label: '4+ Months', value: '4' }
      ];
    }
    
    return data?.value || [];
  }

  // Quotes
  async createQuote(quote: InsertQuote): Promise<Quote> {
    const newQuote: Quote = {
      id: randomUUID(),
      ...quote,
      createdAt: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('kv_store_f150aa0f')
      .upsert({
        key: `quote_${newQuote.id}`,
        value: newQuote
      });

    if (error) {
      console.error('Error creating quote:', error);
      throw new Error('Failed to create quote');
    }

    return newQuote;
  }

  // Initialize data in Supabase (run once to populate the database)
  async initializeData(): Promise<void> {
    // Initialize Regions
    const regionsData: Region[] = [
      { id: "euro-asia", name: "Euro Asia", multiplier: "1.00" },
      { id: "middle-east", name: "Middle East", multiplier: "1.15" },
      { id: "europe", name: "Europe", multiplier: "1.30" },
      { id: "north-america", name: "North America", multiplier: "1.40" },
    ];

    // Initialize Custom Resource Roles
    const customRoles: Role[] = [
      { id: "frontend-developer", name: "Frontend Developer", category: "custom", baseRate: 120 },
      { id: "backend-developer", name: "Backend Developer", category: "custom", baseRate: 130 },
      { id: "fullstack-developer", name: "Full Stack Developer", category: "custom", baseRate: 140 },
      { id: "devops-engineer", name: "DevOps Engineer", category: "custom", baseRate: 150 },
      { id: "data-scientist", name: "Data Scientist", category: "custom", baseRate: 160 },
      { id: "ui-ux-designer", name: "UI/UX Designer", category: "custom", baseRate: 110 },
      { id: "product-manager", name: "Product Manager", category: "custom", baseRate: 180 },
      { id: "project-manager", name: "Project Manager", category: "custom", baseRate: 170 },
      { id: "qa-engineer", name: "QA Engineer", category: "custom", baseRate: 100 },
      { id: "mobile-developer", name: "Mobile Developer", category: "custom", baseRate: 135 },
    ];

    // Initialize SWAT Team Roles
    const swatRoles: Role[] = [
      { id: "swat-frontend", name: "Frontend Specialist", category: "swat", baseRate: 200 },
      { id: "swat-backend", name: "Backend Specialist", category: "swat", baseRate: 220 },
      { id: "swat-devops", name: "DevOps Specialist", category: "swat", baseRate: 250 },
      { id: "swat-architecture", name: "Solution Architect", category: "swat", baseRate: 300 },
      { id: "swat-security", name: "Security Expert", category: "swat", baseRate: 280 },
      { id: "swat-performance", name: "Performance Engineer", category: "swat", baseRate: 240 },
    ];

    // Initialize Seniority Levels
    const seniorityLevels: SeniorityLevel[] = [
      { id: "junior", name: "Junior", multiplier: "0.70" },
      { id: "mid", name: "Mid-Level", multiplier: "1.00" },
      { id: "senior", name: "Senior", multiplier: "1.40" },
      { id: "lead", name: "Lead", multiplier: "1.80" },
      { id: "principal", name: "Principal", multiplier: "2.20" },
    ];

    // Initialize Currencies
    const currencies: Currency[] = [
      { id: "AED", name: "UAE Dirham", symbol: "د.إ", rate: "1.0" },
      { id: "USD", name: "US Dollar", symbol: "$", rate: "0.27" },
      { id: "EUR", name: "Euro", symbol: "€", rate: "0.25" },
      { id: "GBP", name: "British Pound", symbol: "£", rate: "0.21" },
      { id: "INR", name: "Indian Rupee", symbol: "₹", rate: "22.5" },
    ];

    // Initialize Workload Options
    const workloadOptions = [
      { id: '25', label: '25%', value: '25' },
      { id: '50', label: '50%', value: '50' },
      { id: '75', label: '75%', value: '75' },
      { id: '100', label: '100%', value: '100' }
    ];

    // Initialize Duration Options
    const durationOptions = [
      { id: '1', label: '1 Month', value: '1' },
      { id: '2', label: '2 Months', value: '2' },
      { id: '3', label: '3 Months', value: '3' },
      { id: '4', label: '4+ Months', value: '4' }
    ];

    // Store all data in Supabase
    const dataToStore = [
      { key: 'regions', value: regionsData },
      { key: 'roles', value: [...customRoles, ...swatRoles] },
      { key: 'seniority_levels', value: seniorityLevels },
      { key: 'currencies', value: currencies },
      { key: 'workload_options', value: workloadOptions },
      { key: 'duration_options', value: durationOptions },
      { key: 'current_base_currency', value: 'AED' },
    ];

    for (const item of dataToStore) {
      const { error } = await supabase
        .from('kv_store_f150aa0f')
        .upsert({
          key: item.key,
          value: item.value
        });

      if (error) {
        console.error(`Error storing ${item.key}:`, error);
      } else {
        console.log(`Successfully stored ${item.key}`);
      }
    }
  }
}

export const supabaseStorage = new SupabaseStorage();
