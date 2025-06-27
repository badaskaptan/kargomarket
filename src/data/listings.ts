// Ortak Listing tipi
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

// Ortak listings array'i (ListingsPage'deki zengin şema baz alınmıştır)
export const listings: Listing[] = [
  {
    id: 1,
    ilanNo: 'ILN-123456',
    title: 'İstanbul-Ankara Tekstil Yükü',
    route: 'İstanbul → Ankara',
    loadType: 'Tekstil',
    weight: '15 ton',
    volume: '25 m³',
    offers: 8,
    price: '₺4.500',
    urgent: true,
    publishDate: '2 saat önce',
    coordinates: { lat: 41.0082, lng: 28.9784 },
    destination: { lat: 39.9334, lng: 32.8597 },
    ownerId: 'user_456',
    contact: {
      name: 'Mehmet Yılmaz',
      company: 'Yılmaz Tekstil A.Ş.',
      phone: '+90 555 123 4567',
      email: 'mehmet@yilmaztekstil.com',
      rating: 4.8
    },
    description: 'Kaliteli tekstil ürünleri, paletli yük. Yükleme ve boşaltma için forklift gerekli.',
    transportMode: 'road',
    category: 'cargo-trade',
    listingType: 'Satış İlanı'
  },
  {
    id: 2,
    ilanNo: 'NT-654321',
    title: 'İzmir-Bursa Elektronik Eşya Alımı',
    route: 'İzmir → Bursa',
    loadType: 'Elektronik',
    weight: '8 ton',
    volume: '15 m³',
    offers: 12,
    price: '₺3.200',
    urgent: false,
    publishDate: '4 saat önce',
    coordinates: { lat: 38.4192, lng: 27.1287 },
    destination: { lat: 40.1826, lng: 29.0665 },
    ownerId: 'user_123',
    contact: {
      name: 'Ayşe Demir',
      company: 'Demir Elektronik Ltd.',
      phone: '+90 555 987 6543',
      email: 'ayse@demirelektronik.com',
      rating: 4.9
    },
    description: 'Hassas elektronik ürünler alımı yapılacaktır. Özel ambalajlama gerekli.',
    transportMode: 'road',
    category: 'cargo-trade',
    listingType: 'Alım İlanı'
  },
  {
    id: 3,
    ilanNo: 'NK-789012',
    title: 'Ankara-Antalya Gıda Ürünleri Satışı',
    route: 'Ankara → Antalya',
    loadType: 'Gıda',
    weight: '20 ton',
    volume: '30 m³',
    offers: 6,
    price: '₺5.800',
    urgent: true,
    publishDate: '1 saat önce',
    coordinates: { lat: 39.9334, lng: 32.8597 },
    destination: { lat: 36.8969, lng: 30.7133 },
    ownerId: 'user_789',
    contact: {
      name: 'Ali Kaya',
      company: 'Kaya Gıda San. Tic.',
      phone: '+90 555 456 7890',
      email: 'ali@kayagida.com',
      rating: 4.7
    },
    description: 'Organik gıda ürünleri satışı. Soğuk zincir gerektiren ürünler.',
    transportMode: 'road',
    category: 'cargo-trade',
    listingType: 'Satış İlanı'
  },
  {
    id: 4,
    ilanNo: 'ILN-345678',
    title: 'İstanbul-Hamburg Konteyner Taşıma Talebi',
    route: 'İstanbul → Hamburg',
    loadType: 'Genel Kargo',
    weight: '25 ton',
    volume: '67 m³',
    offers: 3,
    price: '€2.800',
    urgent: false,
    publishDate: '6 saat önce',
    coordinates: { lat: 41.0082, lng: 28.9784 },
    destination: { lat: 53.5511, lng: 9.9937 },
    ownerId: 'user_101',
    contact: {
      name: 'Fatma Özkan',
      company: 'Özkan Dış Ticaret',
      phone: '+90 555 321 9876',
      email: 'fatma@ozkandis.com',
      rating: 4.6
    },
    description: '40 HC konteyner taşıma talebi. Gümrük işlemleri dahil.',
    transportMode: 'sea',
    category: 'transport-request',
    listingType: 'Nakliye Talebi'
  },
  {
    id: 5,
    ilanNo: 'NT-987654',
    title: 'Adana-Mersin İnşaat Malzemesi Taşıma',
    route: 'Adana → Mersin',
    loadType: 'İnşaat',
    weight: '30 ton',
    volume: '20 m³',
    offers: 9,
    price: '₺2.100',
    urgent: false,
    publishDate: '3 saat önce',
    coordinates: { lat: 37.0000, lng: 35.3213 },
    destination: { lat: 36.8000, lng: 34.6333 },
    ownerId: 'user_123',
    contact: {
      name: 'Hasan Yıldız',
      company: 'Yıldız İnşaat',
      phone: '+90 555 654 3210',
      email: 'hasan@yildizinsaat.com',
      rating: 4.5
    },
    description: 'Çimento ve demir malzemeler taşıma talebi. Açık kasa araç uygun.',
    transportMode: 'road',
    category: 'transport-request',
    listingType: 'Nakliye Talebi'
  },
  {
    id: 6,
    ilanNo: 'NK-543210',
    title: 'İstanbul-Ankara Karayolu Nakliye Hizmeti',
    route: 'İstanbul → Ankara',
    loadType: 'Genel Kargo',
    weight: '25 ton',
    volume: '90 m³',
    offers: 15,
    price: '₺3.500',
    urgent: false,
    publishDate: '30 dakika önce',
    coordinates: { lat: 41.0082, lng: 28.9784 },
    destination: { lat: 39.9334, lng: 32.8597 },
    ownerId: 'user_202',
    contact: {
      name: 'Zeynep Akar',
      company: 'Akar Nakliyat',
      phone: '+90 555 789 0123',
      email: 'zeynep@akarnakliyat.com',
      rating: 4.9
    },
    description: 'Tır ile karayolu taşımacılığı. Dönüş yükü için uygun fiyat.',
    transportMode: 'road',
    category: 'transport-service',
    listingType: 'Nakliye Hizmeti'
  },
  {
    id: 7,
    ilanNo: 'ILN-678901',
    title: 'İzmir-Antalya Frigorifik Taşıma',
    route: 'İzmir → Antalya',
    loadType: 'Gıda',
    weight: '15 ton',
    volume: '45 m³',
    offers: 7,
    price: '₺4.200',
    urgent: true,
    publishDate: '1 saat önce',
    coordinates: { lat: 38.4192, lng: 27.1287 },
    destination: { lat: 36.8969, lng: 30.7133 },
    ownerId: 'user_123',
    contact: {
      name: 'Murat Şen',
      company: 'Şen Frigorifik',
      phone: '+90 555 111 2233',
      email: 'murat@senfrigorifik.com',
      rating: 4.8
    },
    description: 'Frigorifik araç ile soğuk zincir taşımacılığı. -18°C ile +4°C arası.',
    transportMode: 'road',
    category: 'transport-service',
    listingType: 'Nakliye Hizmeti'
  }
];
