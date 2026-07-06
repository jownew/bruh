'use server';

import { containsProfanity } from './profanityFilter';

/** Lets client components check names without bundling the fs-based filter. */
export async function checkNameForProfanity(name: string): Promise<boolean> {
  return containsProfanity(name);
}
