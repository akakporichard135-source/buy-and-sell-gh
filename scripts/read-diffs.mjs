import { execSync } from 'child_process';
import fs from 'fs';

const files = [
  'src/styles/homepage-reference.css',
  'src/layouts/AdminLayout.tsx',
  'src/pages/admin/AdminSectionPage.tsx',
  'src/App.tsx',
  'src/components/EditorialProductStory.tsx',
  'src/pages/ProductStoryPage.tsx',
  'src/pages/MacLaunchPage.tsx',
  'package.json',
  'vercel.json'
];

for (const file of files) {
  try {
    const diff = execSync(`git diff ${file}`, { encoding: 'utf8' });
    console.log(`\n=================== DIFF: ${file} (${diff.length} chars) ===================`);
    console.log(diff.slice(0, 1500));
    if (diff.length > 1500) console.log('... [truncated]');
  } catch (e) {
    console.error(`Error diffing ${file}:`, e.message);
  }
}
