import fs from 'fs';
import path from 'path';
import { Filter } from 'bad-words';

function loadOverrides(): { block: string[]; allow: string[] } {
  const block: string[] = [];
  const allow: string[] = [];
  try {
    const csvPath = path.join(process.cwd(), 'data', 'custom_profanity.csv');
    const raw = fs.readFileSync(csvPath, 'utf-8');
    const [, ...dataLines] = raw.split('\n').filter((l) => l.trim());
    for (const line of dataLines) {
      const [type, word] = line.split(',').map((s) => s.trim());
      if (type === 'block' && word) block.push(word);
      else if (type === 'allow' && word) allow.push(word);
    }
  } catch {
    // no custom_profanity.csv — fall back to the default word list only
  }
  return { block, allow };
}

const filter = new Filter();
const { block, allow } = loadOverrides();
if (block.length) filter.addWords(...block);
if (allow.length) filter.removeWords(...allow);

/** Server-only: reads data/custom_profanity.csv, so this can't be imported from client components. */
export function containsProfanity(text: string): boolean {
  return filter.isProfane(text);
}
