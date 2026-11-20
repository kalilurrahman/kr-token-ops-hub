import { useEffect, useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Snapshot = {
  id: string;
  name: string;
  calculator: string;
  inputs: [string, string][];
  results: [string, string][];
};

async function storage(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("tokenops-calculator-scenarios", 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("snapshots", { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function snapshots(change?: Snapshot | string): Promise<Snapshot[]> {
  const db = await storage();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction("snapshots", change ? "readwrite" : "readonly");
      const store = transaction.objectStore("snapshots");
      if (typeof change === "string") store.delete(change);
      else if (change) store.put(change);
      const request = store.getAll();
      transaction.oncomplete = () => resolve(request.result as Snapshot[]);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    db.close();
  }
}

export function ScenarioComparison() {
  const [saved, setSaved] = useState<Snapshot[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [calculator, setCalculator] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  useEffect(() => {
    const headings = Array.from(document.querySelectorAll(".calc-card h2")).map(
      (node) => node.textContent ?? "",
    );
    setOptions(["Blended savings", ...headings]);
    setCalculator("Blended savings");
    void snapshots()
      .then(setSaved)
      .catch(() =>
        setError("Device storage is unavailable. Allow site storage to save scenarios."),
      );
  }, []);

  const save = async () => {
    if (!name.trim() || busy) return;
    const root =
      calculator === "Blended savings"
        ? document.querySelector(".calculator-layout")
        : Array.from(document.querySelectorAll(".calc-card")).find(
            (node) => node.querySelector("h2")?.textContent === calculator,
          );
    if (!root) return;
    const inputs: [string, string][] = Array.from(root.querySelectorAll("form label")).map(
      (label) => {
        const field = label.querySelector("input, select");
        const title = Array.from(label.childNodes)
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((node) => node.textContent)
          .join("")
          .trim();
        const value =
          field instanceof HTMLSelectElement
            ? (field.selectedOptions[0]?.textContent ?? field.value)
            : field instanceof HTMLInputElement
              ? field.value
              : "";
        return [title, value];
      },
    );
    const results: [string, string][] = Array.from(root.querySelectorAll(".row, .metric-row")).map(
      (row) => [
        row.querySelector("span")?.textContent ?? "",
        row.querySelector("strong")?.textContent?.trim() ?? "",
      ],
    );
    setBusy(true);
    setError("");
    try {
      const entry = { id: crypto.randomUUID(), name: name.trim(), calculator, inputs, results };
      setSaved(await snapshots(entry));
      setSelected((current) => [...current, entry.id]);
      setName("");
    } catch {
      setError("Could not save this scenario. Check available device storage.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    try {
      setSaved(await snapshots(id));
      setSelected((current) => current.filter((value) => value !== id));
    } catch {
      setError("Could not delete this saved scenario.");
    }
  };

  return (
    <section className="stack" aria-labelledby="scenario-heading">
      <h2 id="scenario-heading">Saved scenario comparison</h2>
      <p>
        Private on this device. Snapshots retain inputs and displayed results at the time of saving;
        prices are not refreshed.
      </p>
      <form
        className="grid gap-4 md:grid-cols-3"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <label>
          Calculator
          <select value={calculator} onChange={(event) => setCalculator(event.target.value)}>
            {options.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label>
          Scenario name
          <input
            value={name}
            maxLength={80}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
        <Button
          type="submit"
          variant="outline"
          className="self-end"
          disabled={busy || !name.trim()}
        >
          <Save aria-hidden="true" />
          Save current results
        </Button>
      </form>
      {error && <p role="alert">{error}</p>}
      {saved.length === 0 && <p>No saved scenarios yet.</p>}
      <div className="flex flex-wrap gap-4">
        {saved.map((entry) => (
          <label key={entry.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.includes(entry.id)}
              onChange={(event) =>
                setSelected((current) =>
                  event.target.checked
                    ? [...current, entry.id]
                    : current.filter((id) => id !== entry.id),
                )
              }
            />
            {entry.name}
          </label>
        ))}
      </div>
      <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
        {saved
          .filter((entry) => selected.includes(entry.id))
          .map((entry) => (
            <article key={entry.id} className="resource-card min-w-0 break-words">
              <div className="flex items-start justify-between gap-2">
                <h3>{entry.name}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${entry.name}`}
                  title="Delete scenario"
                  onClick={() => void remove(entry.id)}
                >
                  <Trash2 />
                </Button>
              </div>
              <p>{entry.calculator}</p>
              <dl className="space-y-3">
                {entry.results.map(([label, value], index) => (
                  <div key={index}>
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="font-mono tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>
              <details className="mt-4">
                <summary>Saved inputs</summary>
                <dl>
                  {entry.inputs.map(([label, value], index) => (
                    <div key={index} className="mt-2">
                      <dt>{label}</dt>
                      <dd className="font-mono tabular-nums">{value}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            </article>
          ))}
      </div>
    </section>
  );
}
