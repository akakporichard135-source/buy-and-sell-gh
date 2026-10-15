import { execSync } from 'child_process';

try {
  const status = execSync('git status --short', { encoding: 'utf8' });
  console.log('=== GIT STATUS SHORT ===\n', status);

  const diffNames = execSync('git diff --name-only', { encoding: 'utf8' });
  console.log('=== MODIFIED TRACKED FILES ===\n', diffNames);
} catch (e) {
  console.error('Error running git:', e);
}
