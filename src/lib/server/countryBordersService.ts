const RESTCOUNTRIES_TRANSLATION_URL = 'https://restcountries.com/v3.1/translation/';
const RESTCOUNTRIES_NAME_URL = 'https://restcountries.com/v3.1/name/';
const GEOCOUNTRIES_DATASET_URL = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

let countriesGeoJsonPromise: Promise<GeoJSON.FeatureCollection> | null = null;
const borderByCca3 = new Map<string, GeoJSON.Feature>();
const cca3ByQuery = new Map<string, string>();

async function loadCountriesDataset(): Promise<GeoJSON.FeatureCollection> {
  if (!countriesGeoJsonPromise) {
    countriesGeoJsonPromise = fetch(GEOCOUNTRIES_DATASET_URL).then(async (r) => {
      if (!r.ok) throw new Error(`Failed to load countries dataset: ${r.status}`);
      return (await r.json()) as GeoJSON.FeatureCollection;
    });
  }
  return countriesGeoJsonPromise;
}

async function resolveCca3(countryName: string): Promise<string | null> {
  const key = countryName.trim().toLowerCase();
  const cached = cca3ByQuery.get(key);
  if (cached) return cached;

  const tryFetch = async (url: string) => {
    const res = await fetch(url + encodeURIComponent(countryName));
    if (!res.ok) return null;
    const data = (await res.json()) as any[];
    const cca3 = data?.[0]?.cca3 as string | undefined;
    return cca3 ?? null;
  };

  const cca3 = (await tryFetch(RESTCOUNTRIES_TRANSLATION_URL)) ?? (await tryFetch(RESTCOUNTRIES_NAME_URL));
  if (cca3) cca3ByQuery.set(key, cca3);
  return cca3;
}

export async function getCountryBorderFeatureByName(countryName: string): Promise<GeoJSON.Feature | null> {
  const cca3 = await resolveCca3(countryName);
  if (!cca3) return null;

  const cached = borderByCca3.get(cca3);
  if (cached) return cached;

  const fc = await loadCountriesDataset();
  const feature = (fc.features as GeoJSON.Feature[]).find((f) => {
    const props: any = f.properties ?? {};
    const iso = props['ISO3166-1-Alpha-3'] ?? props.ISO_A3 ?? props.iso_a3 ?? props.ADM0_A3;
    if (typeof iso === 'string' && iso.toUpperCase() === cca3) return true;

    const name = props.name;
    return typeof name === 'string' && name.trim().toLowerCase() === countryName.trim().toLowerCase();
  });

  if (!feature) return null;
  borderByCca3.set(cca3, feature);
  return feature;
}
