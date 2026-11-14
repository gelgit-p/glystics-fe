// Public courier directory (no auth): served by GET /public/couriers on the API,
// which proxies Shipbubble and only returns marketing-safe fields.
export interface PublicCourier {
  name: string;
  serviceCode: string;
  pinImage: string | null;
  originCountry: string;
  international: boolean;
  domestic: boolean;
  express: boolean;
  operational: boolean;
  packageCategories: string[];
}

export interface CourierCoverageArea {
  country: string;
  countryCode: string;
  pickupStates: string[];
  deliveryStates: string[];
  routes?: string[];
}

const base = () => import.meta.env.VITE_API_URL as string;

export const couriersApi = {
  async list(): Promise<PublicCourier[]> {
    const res = await fetch(`${base()}/public/couriers`, { headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`Could not load couriers (${res.status})`);
    const body: unknown = await res.json();
    return Array.isArray(body) ? (body as PublicCourier[]) : [];
  },
  // Coverage is a GET upstream (Shipbubble) and on our API; POST there 404s in effect.
  async coverage(serviceCode: string): Promise<CourierCoverageArea[]> {
    const res = await fetch(`${base()}/public/couriers/${encodeURIComponent(serviceCode)}/coverage`, {
      headers: { accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`Could not load coverage (${res.status})`);
    const body: unknown = await res.json();
    return Array.isArray(body) ? (body as CourierCoverageArea[]) : [];
  },
};
