import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, FolderPlus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createReadingCollection,
  deleteReadingCollection,
  DEFAULT_COLLECTION_ID,
  getReadingCollections,
  READING_LISTS_CHANGED,
  saveCollection,
} from "@/lib/reading-lists";
import type { ReadingCollection } from "@/types/reading-list.types";

export const Route = createFileRoute("/reading-lists")({
  component: ReadingListsPage,
  head: () => ({
    meta: [
      { title: "Private reading lists — TokenOps Atlas" },
      { name: "description", content: "Organize TokenOps model and technique briefings into private collections stored on this device." },
      { property: "og:title", content: "Private reading lists — TokenOps Atlas" },
      { property: "og:description", content: "Return to saved TokenOps model and technique briefings from private device-local collections." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function ReadingListsPage() {
  const [collections, setCollections] = useState<ReadingCollection[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const refresh = async () => {
    try {
      setCollections(await getReadingCollections());
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Reading lists could not be loaded.");
    }
  };

  useEffect(() => {
    void refresh();
    window.addEventListener(READING_LISTS_CHANGED, refresh);
    return () => window.removeEventListener(READING_LISTS_CHANGED, refresh);
  }, []);

  const createCollection = async () => {
    if (!name.trim()) return;
    await createReadingCollection(name);
    setName("");
  };

  const renameCollection = async (collection: ReadingCollection) => {
    const nextName = window.prompt("Collection name", collection.name)?.trim();
    if (!nextName) return;
    await saveCollection({ ...collection, name: nextName });
  };

  return (
    <section className="stack">
      <div className="page-heading">
        <p className="eyebrow">Private by design</p>
        <h1>Reading lists</h1>
        <p>Bookmarks are stored only in this browser on this device. No account, tracking, or cloud sync is used.</p>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 sm:flex-row">
        <label className="sr-only" htmlFor="new-collection">New collection name</label>
        <input id="new-collection" className="min-h-11 min-w-0 flex-1 rounded-md px-3" value={name} onChange={(event) => setName(event.target.value)} placeholder="New collection name" maxLength={60} />
        <Button type="button" onClick={() => void createCollection()} disabled={!name.trim()}><FolderPlus /> Create collection</Button>
      </div>

      {error && <p role="alert" className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-4 text-[var(--red)]">{error}</p>}
      <div className="grid gap-5">
        {collections.map((collection) => (
          <section className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]" key={collection.id}>
            <header className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
              <div>
                <h2 className="mb-1">{collection.name}</h2>
                <p className="m-0 text-sm text-[var(--muted)]">{collection.items.length} saved {collection.items.length === 1 ? "briefing" : "briefings"}</p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="icon" title="Rename collection" aria-label={`Rename ${collection.name}`} onClick={() => void renameCollection(collection)}><Pencil /></Button>
                {collection.id !== DEFAULT_COLLECTION_ID && <Button type="button" variant="outline" size="icon" title="Delete collection" aria-label={`Delete ${collection.name}`} onClick={() => void deleteReadingCollection(collection.id)}><Trash2 /></Button>}
              </div>
            </header>
            {collection.items.length === 0 ? (
              <p className="m-0 text-[var(--muted)]">No briefings saved here yet. Open a model or technique briefing and use its bookmark control.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {collection.items.map((item) => (
                  <article className="rounded-md border border-[var(--line)] p-4" key={item.file}>
                    <span className="category-tag">{item.category}</span>
                    <h3 className="mt-3">{item.title}</h3>
                    <p className="text-sm text-[var(--muted)]">{item.description}</p>
                    <Link className="download-btn mt-3 w-fit" to="/read/$" params={{ _splat: item.file }}><BookOpen size={15} /> Reopen</Link>
                  </article>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </section>
  );
}