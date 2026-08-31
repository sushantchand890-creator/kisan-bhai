export interface FarmProfile {
  name: string;
  location: string;
  size: string;
  soilType: string;
  primaryCrops: string[];
  waterResources: string;
  language: 'en' | 'hi' | 'pa' | 'mr';
  role?: 'farmer' | 'buyer' | 'both';
  isGuest?: boolean;
  avatarId?: string;
}

export interface AgriItem {
  id: string;
  title: string;
  category: 'grains' | 'vegetables' | 'fruits' | 'seeds' | 'machinery' | 'compost';
  price: number;
  unit: string; // e.g. "Quintal", "Kg", "Piece"
  sellerName: string;
  sellerPhone: string;
  sellerRole: 'farmer' | 'trader';
  location: string;
  distanceKm: number;
  tradeType: 'farm_direct' | 'p2p';
  quantityAvailable: string;
  description: string;
  imageUrl: string;
  isVerifiedFarm: boolean;
  dateListed: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  audio?: string;
}

export interface GrowthRecord {
  id: string;
  date: string;
  image: string;
  cropType: string;
  analysis: string;
  stage: string;
}

export interface FertilizerAdvice {
  type: string;
  quantity: string;
  timing: string;
  applicationMethod: string;
  precautions: string;
}

export interface Scheme {
  id: string;
  name: string;
  description: string;
  eligibility: string;
  benefits: string;
  category: 'subsidy' | 'insurance' | 'finance';
}
