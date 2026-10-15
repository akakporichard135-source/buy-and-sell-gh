import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);
const emailMatch = env.match(/VITE_LOCAL_ADMIN_EMAIL="?([^"\r\n]+)"?/);
const passMatch = env.match(/VITE_LOCAL_ADMIN_PASSWORD="?([^"\r\n]+)"?/);

const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function main() {
  console.log('Attempting sign in with:', emailMatch[1].trim());
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailMatch[1].trim(),
    password: passMatch[1].trim(),
  });

  if (error) {
    console.error('Sign-in error:', error);
    return;
  }

  console.log('Signed in successfully!');
  console.log('User ID:', data.user?.id);
  console.log('Email:', data.user?.email);
  console.log('Session AAL:', data.session?.user?.app_metadata);

  // Now try querying media_library with this authenticated client!
  const authedClient = createClient(urlMatch[1].trim(), keyMatch[1].trim(), {
    global: {
      headers: {
        Authorization: `Bearer ${data.session?.access_token}`,
      },
    },
  });

  const { data: media, error: mediaErr } = await authedClient
    .from('media_library')
    .select('*');

  if (mediaErr) {
    console.error('Authed media_library query error:', mediaErr);
  } else {
    console.log(`\nAuthed media_library count: ${media.length} records`);
    media.forEach((m, i) => {
      console.log(`${i + 1}. [${m.category}] id="${m.id}" | title="${m.title}"`);
    });
  }
}

main().catch(console.error);
