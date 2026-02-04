export interface Category {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  tierListsCount: number;
  isActive: boolean;
  createdAt: Date;
}

export interface MasterItem {
  id: string;
  categoryId: string;
  name: string;
  imageUrl: string;
  externalId: string | null;
  externalSource: 'igdb' | 'rawg' | 'mal' | 'anilist' | 'custom' | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}
