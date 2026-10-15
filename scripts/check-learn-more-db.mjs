import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);

const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function check() {
  console.log("Checking learn_more_published...");
  const pub = await supabase.from('learn_more_published').select('id, updated_at');
  console.log("learn_more_published:", pub.error ? pub.error.message : pub.data);

  console.log("\nChecking learn_more_drafts...");
  const draft = await supabase.from('learn_more_drafts').select('id, updated_at');
  console.log("learn_more_drafts:", draft.error ? draft.error.message : draft.data);

  console.log("\nChecking storage buckets...");
  const buckets = await supabase.storage.listBuckets();
  console.log("Storage buckets:", buckets.error ? buckets.error.message : buckets.data?.map(b => b.name));
}

check().catch(console.error);
