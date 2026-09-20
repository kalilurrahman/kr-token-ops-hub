export interface SavedBriefing {
  file: string;
  title: string;
  description: string;
  category: string;
  savedAt: string;
}

export interface ReadingCollection {
  id: string;
  name: string;
  createdAt: string;
  items: SavedBriefing[];
}
