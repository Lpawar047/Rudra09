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

export const TALUKA_OPTIONS = [
  'All Talukas',
  ...VALID_TALUKAS
] as const;
