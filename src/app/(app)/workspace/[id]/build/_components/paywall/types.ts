export interface PSFeature {
  id: string;
  title: string;
  description: string | null;
  category: string;
  columnId: string;
}

export interface PSTier {
  id: string;
  name: string;
  order: number;
  prices: Record<string, string> | null;
  notes: string | null;
  featureIds: string[]; // ids of features included in this tier
}
