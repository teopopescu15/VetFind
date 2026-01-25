export type GeocodeResult = { latitude: number; longitude: number };

/**
 * Build a human-friendly address string for geocoding.
 * Works with Romanian-style fields used in the app.
 */
export function buildAddressForGeocoding(data: {
  street?: string;
  streetNumber?: string;
  building?: string;
  apartment?: string;
  city?: string;
  county?: string;
  postalCode?: string;
  country?: string;
}): string {
  const parts: string[] = [];

  const streetLine = [data.street?.trim(), data.streetNumber?.trim()].filter(Boolean).join(' ');
  if (streetLine) parts.push(streetLine);
  if (data.building?.trim()) parts.push(`Bloc ${data.building.trim()}`);
  if (data.apartment?.trim()) parts.push(`Ap. ${data.apartment.trim()}`);
  if (data.city?.trim()) parts.push(data.city.trim());
  if (data.county?.trim()) parts.push(data.county.trim());
  if (data.postalCode?.trim()) parts.push(data.postalCode.trim());
  const country = (data.country ?? 'Romania').trim();
  if (country) parts.push(country);

  return parts.join(', ');
}

/**
 * Geocode an address using OpenStreetMap Nominatim.
 * Returns null when no result is found.
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const q = String(address || '').trim();
  if (!q) return null;

  const url =
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1` +
    `&q=${encodeURIComponent(q)}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      // Nominatim requires a valid UA; in RN this is best-effort.
      Accept: 'application/json',
    },
  });

  if (!res.ok) return null;
  const data: any = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;

  const first = data[0];
  const lat = Number(first?.lat);
  const lon = Number(first?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  return { latitude: lat, longitude: lon };
}

