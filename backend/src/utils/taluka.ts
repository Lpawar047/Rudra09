export const VALID_TALUKAS = [
  'Nashik',
  'Igatpuri',
  'Trimbakeshwar',
  'Dindori',
  'Peth',
  'Kalwan',
  'Surgana',
  'Chandwad',
  'Deola',
  'Baglan (Satana)',
  'Malegaon',
  'Nandgaon',
  'Yeola',
  'Niphad',
  'Sinnar',
] as const;

export type Taluka = typeof VALID_TALUKAS[number];

// Normalizes an incoming raw string to one of the 15 exact authorized Taluka names.
// Returns null if the value is missing or does not match an authorized Taluka.
export function normalizeTaluka(val: any): Taluka | null {
  if (!val || typeof val !== 'string') return null;
  const clean = val.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!clean) return null;

  for (const t of VALID_TALUKAS) {
    const targetNorm = t.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean === targetNorm) {
      return t;
    }
  }

  // Common aliases
  if (clean === 'satana' || clean === 'baglan' || clean === 'baglansatana') {
    return 'Baglan (Satana)';
  }
  if (clean === 'trimbak' || clean === 'tryambakeshwar') {
    return 'Trimbakeshwar';
  }
  if (clean === 'peint') {
    return 'Peth';
  }

  return null;
}
