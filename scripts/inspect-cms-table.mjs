import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);

const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function main() {
  const { data, error } = await supabase
    .from('homepage_cms')
    .select('*');

  console.log('homepage_cms error:', error);
  if (data && data.length > 0) {
    console.log('homepage_cms records:', data.length);
    console.log('Data:', JSON.stringify(data, null, 2));
  } else {
    console.log('No homepage_cms records found or table empty.');
  }
}

main().catch(console.error);
