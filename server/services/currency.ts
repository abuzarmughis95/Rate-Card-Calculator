export async function updateExchangeRates(baseCurrency: string = 'AED'): Promise<{ [key: string]: number }> {
  try {
    const apiKey = '092b467576c6a693b18c8cda';
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${baseCurrency}`;
    
    console.log(`Fetching exchange rates from ExchangeRate-API v6 for base currency: ${baseCurrency}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RateCardCalculator/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.result !== 'success') {
      throw new Error(`API Error: ${data.error || 'Unknown error'}`);
    }
    
    // Extract rates from the conversion_rates object
    const rates = data.conversion_rates;
    
    if (!rates) {
      throw new Error('No conversion rates found in API response');
    }
    
    console.log(`Successfully fetched rates for ${baseCurrency} from ExchangeRate-API v6`);
    console.log(`Last updated: ${data.time_last_update_utc}`);
    
    return {
      AED: rates.AED || 1.0,
      USD: rates.USD || 0.272,
      EUR: rates.EUR || 0.25,
      GBP: rates.GBP || 0.215,
      INR: rates.INR || 22.5,
      PKR: rates.PKR || 75.5,
      CAD: rates.CAD || 0.37,
      AUD: rates.AUD || 0.41,
      JPY: rates.JPY || 40.2,
      CHF: rates.CHF || 0.24,
      CNY: rates.CNY || 1.95,
    };
  } catch (error) {
    console.error('Error fetching exchange rates from ExchangeRate-API v6:', error);
    console.log('Falling back to default rates');
    
    // Return fallback rates
    return {
      AED: 1.0,
      USD: 0.272,
      EUR: 0.25,
      GBP: 0.215,
      INR: 22.5,
      PKR: 75.5,
      CAD: 0.37,
      AUD: 0.41,
      JPY: 40.2,
      CHF: 0.24,
      CNY: 1.95,
    };
  }
}
