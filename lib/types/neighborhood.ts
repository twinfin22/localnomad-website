export interface Neighborhood {
  name: string;
  city: string;
  coordinates: [number, number]; // [lat, lng]
  rent: string;
  vibe: string;
  pros: string[];
  cons: string[];
  walkability: number | null;
  safety: number | null;
  tags: string[];
  imageUrl: string | null;
}

export interface City {
  name: string;
  coordinates: [number, number];
  neighborhoods: Neighborhood[];
}

export interface CountryNeighborhoodData {
  country: string;
  cities: City[];
}
