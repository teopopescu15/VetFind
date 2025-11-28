/**
 * Romanian Geographic Data Constants
 * Contains counties (județe) and related data for Romanian localization
 */

// Romanian Counties (Județe) - All 41 counties + București
export const ROMANIAN_COUNTIES = [
  { code: 'AB', name: 'Alba' },
  { code: 'AR', name: 'Arad' },
  { code: 'AG', name: 'Argeș' },
  { code: 'BC', name: 'Bacău' },
  { code: 'BH', name: 'Bihor' },
  { code: 'BN', name: 'Bistrița-Năsăud' },
  { code: 'BT', name: 'Botoșani' },
  { code: 'BR', name: 'Brăila' },
  { code: 'BV', name: 'Brașov' },
  { code: 'B', name: 'București' },
  { code: 'BZ', name: 'Buzău' },
  { code: 'CL', name: 'Călărași' },
  { code: 'CS', name: 'Caraș-Severin' },
  { code: 'CJ', name: 'Cluj' },
  { code: 'CT', name: 'Constanța' },
  { code: 'CV', name: 'Covasna' },
  { code: 'DB', name: 'Dâmbovița' },
  { code: 'DJ', name: 'Dolj' },
  { code: 'GL', name: 'Galați' },
  { code: 'GR', name: 'Giurgiu' },
  { code: 'GJ', name: 'Gorj' },
  { code: 'HR', name: 'Harghita' },
  { code: 'HD', name: 'Hunedoara' },
  { code: 'IL', name: 'Ialomița' },
  { code: 'IS', name: 'Iași' },
  { code: 'IF', name: 'Ilfov' },
  { code: 'MM', name: 'Maramureș' },
  { code: 'MH', name: 'Mehedinți' },
  { code: 'MS', name: 'Mureș' },
  { code: 'NT', name: 'Neamț' },
  { code: 'OT', name: 'Olt' },
  { code: 'PH', name: 'Prahova' },
  { code: 'SJ', name: 'Sălaj' },
  { code: 'SM', name: 'Satu Mare' },
  { code: 'SB', name: 'Sibiu' },
  { code: 'SV', name: 'Suceava' },
  { code: 'TR', name: 'Teleorman' },
  { code: 'TM', name: 'Timiș' },
  { code: 'TL', name: 'Tulcea' },
  { code: 'VL', name: 'Vâlcea' },
  { code: 'VS', name: 'Vaslui' },
  { code: 'VN', name: 'Vrancea' },
] as const;

// București Sectors (if needed for detailed addressing)
export const BUCHAREST_SECTORS = [
  { code: 'S1', name: 'Sector 1' },
  { code: 'S2', name: 'Sector 2' },
  { code: 'S3', name: 'Sector 3' },
  { code: 'S4', name: 'Sector 4' },
  { code: 'S5', name: 'Sector 5' },
  { code: 'S6', name: 'Sector 6' },
] as const;

// Type exports
export type CountyCode = typeof ROMANIAN_COUNTIES[number]['code'];
export type SectorCode = typeof BUCHAREST_SECTORS[number]['code'];

// Helper function to get county name from code
export const getCountyName = (code: CountyCode): string | undefined => {
  return ROMANIAN_COUNTIES.find((county) => county.code === code)?.name;
};

// Helper function to get sector name from code
export const getSectorName = (code: SectorCode): string | undefined => {
  return BUCHAREST_SECTORS.find((sector) => sector.code === code)?.name;
};
