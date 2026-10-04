import type { ReadingCollection, SavedBriefing } from "@/types/reading-list.types";

const DB_NAME = "tokenops-reading-lists";
const STORE_NAME = "collections";
const DB_VERSION = 1;
export const DEFAULT_COLLECTION_ID = "saved";
export const READING_LISTS_CHANGED = "tokenops-reading-lists-changed";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Reading lists could not be opened."));
  });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Reading list update failed."));
  });
}

async function ensureDefaultCollection(database: IDBDatabase): Promise<void> {
  const transaction = database.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  const existing = await requestResult(
    store.get(DEFAULT_COLLECTION_ID) as IDBRequest<ReadingCollection | undefined>,
  );
  if (!existing) {
    await requestResult(
      store.put({
        id: DEFAULT_COLLECTION_ID,
        name: "Saved",
        createdAt: new Date().toISOString(),
        items: [],
      }),
    );
  }
}

export async function getReadingCollections(): Promise<ReadingCollection[]> {
  const database = await openDatabase();
  await ensureDefaultCollection(database);
  const transaction = database.transaction(STORE_NAME, "readonly");
  const collections = await requestResult(
    transaction.objectStore(STORE_NAME).getAll() as IDBRequest<ReadingCollection[]>,
  );
  database.close();
  return collections.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function saveCollection(collection: ReadingCollection): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, "readwrite");
  await requestResult(transaction.objectStore(STORE_NAME).put(collection));
  database.close();
  window.dispatchEvent(new Event(READING_LISTS_CHANGED));
}

export async function createReadingCollection(name: string): Promise<ReadingCollection> {
  const collection: ReadingCollection = {
    id: crypto.randomUUID(),
    name: name.trim(),
    createdAt: new Date().toISOString(),
    items: [],
  };
  await saveCollection(collection);
  return collection;
}

export async function deleteReadingCollection(id: string): Promise<void> {
  if (id === DEFAULT_COLLECTION_ID) return;
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, "readwrite");
  await requestResult(transaction.objectStore(STORE_NAME).delete(id));
  database.close();
  window.dispatchEvent(new Event(READING_LISTS_CHANGED));
}

export async function toggleBriefingInCollection(
  collectionId: string,
  briefing: SavedBriefing,
): Promise<boolean> {
  const collections = await getReadingCollections();
  const collection = collections.find((entry) => entry.id === collectionId);
  if (!collection) return false;
  const exists = collection.items.some((entry) => entry.file === briefing.file);
  const items = exists
    ? collection.items.filter((entry) => entry.file !== briefing.file)
    : [...collection.items, { ...briefing, savedAt: new Date().toISOString() }];
  await saveCollection({ ...collection, items });
  return !exists;
}
