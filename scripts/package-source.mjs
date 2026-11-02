import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';

// Provide the corresponding AGPL source alongside the deployed static site.
const filenames = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {
  encoding: 'utf8',
})
  .split('\0')
  .filter(
    (filename) =>
      filename &&
      filename !== 'public/source.tar.gz' &&
      !filename.startsWith('docs/assets/') &&
      !filename.startsWith('docs/design/') &&
      fs.existsSync(filename),
  );

const result = spawnSync('tar', ['-czf', 'public/source.tar.gz', '--null', '-T', '-'], {
  input: `${filenames.join('\0')}\0`,
  encoding: 'utf8',
});
if (result.error) throw result.error;
if (result.status !== 0) throw new Error(result.stderr || 'Failed to package corresponding source');
console.log(`Source download prepared (${filenames.length} files).`);
