export interface Listing {
  id: number | string;
  ilanNo: string;
  title: string;
  route: string;
  loadType: string;
  weight: string;
  volume?: string;
  offers: number;
  price: string;
  urgent: boolean;
  publishDate?: string;
  coordinates: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  ownerId?: string;
  contact: {
    name: string;
    company?: string;
    phone?: string;
    email?: string;
    rating?: number;
  };
  description?: string;
  transportMode?: string;
  category?: string;
  listingType?: string;
}
