import { CountyCode } from './romania';

/**
 * Minimal locality dataset for Romania.
 *
 * Notes:
 * - This is intentionally a STARTER dataset to enable the county -> locality dropdown UX.
 * - Expand this list over time (or swap to a backend-fed source).
 */
export const ROMANIA_LOCALITIES_BY_COUNTY: Record<CountyCode, string[]> = {
  AB: ['Alba Iulia', 'Aiud', 'Blaj', 'Cugir', 'Sebeș'],
  AG: ['Pitești', 'Câmpulung', 'Curtea de Argeș', 'Mioveni'],
  AR: ['Arad', 'Ineu', 'Lipova', 'Pecica'],
  B: ['București'],
  BC: ['Bacău', 'Moinești', 'Onești'],
  BH: ['Oradea', 'Beiuș', 'Marghita', 'Salonta'],
  BN: ['Bistrița', 'Năsăud'],
  BR: ['Brăila', 'Făurei'],
  BT: ['Botoșani', 'Dorohoi'],
  BV: ['Brașov', 'Făgăraș', 'Râșnov', 'Săcele'],
  BZ: ['Buzău', 'Râmnicu Sărat'],
  CJ: ['Cluj-Napoca', 'Turda', 'Dej', 'Gherla'],
  CL: ['Călărași', 'Oltenița'],
  CS: ['Reșița', 'Caransebeș'],
  CT: ['Constanța', 'Mangalia', 'Medgidia', 'Năvodari'],
  CV: ['Sfântu Gheorghe', 'Târgu Secuiesc'],
  DB: ['Târgoviște', 'Moreni'],
  DJ: ['Craiova', 'Băilești', 'Calafat'],
  GJ: ['Târgu Jiu', 'Motru'],
  GL: ['Galați', 'Tecuci'],
  GR: ['Giurgiu', 'Bolintin-Vale'],
  HD: ['Deva', 'Hunedoara', 'Petroșani'],
  HR: ['Miercurea Ciuc', 'Odorheiu Secuiesc', 'Gheorgheni'],
  IF: ['Buftea', 'Otopeni', 'Voluntari', 'Popești-Leordeni'],
  IL: ['Slobozia', 'Fetești'],
  IS: ['Iași', 'Pașcani'],
  MH: ['Drobeta-Turnu Severin', 'Orșova'],
  MM: ['Baia Mare', 'Sighetu Marmației'],
  MS: ['Târgu Mureș', 'Sighișoara', 'Reghin'],
  NT: ['Piatra Neamț', 'Roman'],
  OT: ['Slatina', 'Caracal'],
  PH: ['Ploiești', 'Câmpina', 'Băicoi'],
  SB: ['Sibiu', 'Mediaș'],
  SJ: ['Zalău', 'Șimleu Silvaniei'],
  SM: ['Satu Mare', 'Carei'],
  SV: ['Suceava', 'Fălticeni', 'Rădăuți'],
  TL: ['Tulcea', 'Măcin'],
  TM: ['Timișoara', 'Lugoj'],
  TR: ['Alexandria', 'Roșiorii de Vede'],
  VL: ['Râmnicu Vâlcea', 'Drăgășani'],
  VN: ['Focșani', 'Adjud'],
  VS: ['Vaslui', 'Bârlad', 'Huși'],
} as const;

export const getLocalitiesForCounty = (county: CountyCode | ''): string[] => {
  if (!county) return [];
  const list = ROMANIA_LOCALITIES_BY_COUNTY[county];
  return Array.isArray(list) ? list : [];
};
