import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);

const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function main() {
  const { data, error } = await supabase
    .from('media_library')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching media_library:', error);
    return;
  }

  console.log(`=== LIVE SUPABASE MEDIA_LIBRARY (${data.length} records) ===`);
  data.forEach((row, i) => {
    console.log(`${i + 1}. [${row.category}] id="${row.id}" | title="${row.title}" | url="${row.url}" | fit="${row.fit}"`);
  });
}

main().catch(console.error);
