// Test script to verify Supabase connection and table structure
import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables:');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

console.log('🔗 Testing Supabase connection...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test basic connection
    console.log('\n1️⃣ Testing basic connection...');
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error);
      return;
    }
    
    console.log('✅ Connection successful');
    
    // Test table structure
    console.log('\n2️⃣ Testing table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table access failed:', tableError);
      return;
    }
    
    console.log('✅ Table access successful');
    console.log('📋 Table columns:', Object.keys(tableInfo[0] || {}));
    
    // Test RLS policies
    console.log('\n3️⃣ Testing RLS policies...');
    const { data: policyTest, error: policyError } = await supabase
      .from('user_profiles')
      .select('id, user_id, twitter_connected')
      .limit(5);
    
    if (policyError) {
      console.error('❌ RLS policy test failed:', policyError);
      return;
    }
    
    console.log('✅ RLS policies working');
    console.log('📊 Sample data:', policyTest);
    
    console.log('\n🎉 All tests passed! Database connection is working properly.');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

testConnection();
