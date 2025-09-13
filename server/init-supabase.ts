import 'dotenv/config';
import { supabaseStorage } from './supabaseStorage';

async function initializeSupabase() {
  try {
    console.log('Initializing Supabase with sample data...');
    await supabaseStorage.initializeData();
    console.log('✅ Supabase initialization completed successfully!');
  } catch (error) {
    console.error('❌ Error initializing Supabase:', error);
    process.exit(1);
  }
}

initializeSupabase();
