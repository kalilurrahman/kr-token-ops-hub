import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Code2, Database, Download, LineChart, Zap } from "lucide-react";
import {
  modelPricingData,
  compressPrompt,
  downloadTemplate,
  type CompressionResult,
} from "@/tokenops/data";

export const Route = createFileRoute("/toolkit")({
  component: ToolkitPage,
  head: () => ({
    meta: [
      { title: "Toolkit — TokenOps Atlas" },
      {
        name: "description",
        content:
          "Live prompt compressor, model cost comparator, and reference implementation downloads.",
      },
    ],
  }),
});

function ToolkitPage() {
  const [promptInput, setPromptInput] = useState(
    "Please kindly analyze the following data and could you provide a comprehensive summary. It is important that you include all relevant details. Thank you for your help, I would appreciate it if you could also just basically identify the key trends in order to support our decision making process.",
  );
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [compInputTokens, setCompInputTokens] = useState(2000);
  const [compOutputTokens, setCompOutputTokens] = useState(500);
  const [compDailyRequests, setCompDailyRequests] = useState(100_000);

  const comparisonData = useMemo(() => {
    return Object.entries(modelPricingData)
      .map(([name, pricing]) => {
        const costPerRequest =
          (compInputTokens * pricing.input + compOutputTokens * pricing.output) / 1_000_000;
        const monthlyCost = costPerRequest * compDailyRequests * 30;
        return {
          name,
          costPerRequest,
          monthlyCost,
          inputRate: pricing.input,
          outputRate: pricing.output,
        };
      })
      .sort((a, b) => a.monthlyCost - b.monthlyCost);
  }, [compInputTokens, compOutputTokens, compDailyRequests]);

  const cheapest = comparisonData[0];
  const mostExpensive = comparisonData[comparisonData.length - 1];

  return (
    <section className="stack">
      <div className="page-heading">
        <h1>Toolkit</h1>
        <p>
          Interactive tools to test TokenOps optimization strategies. Try prompt compression and
          model cost comparison live.
        </p>
      </div>

      <div className="toolkit-panel">
        <div className="toolkit-panel-header">
          <Zap size={20} />
          <div>
            <h3>Prompt Compressor</h3>
            <p>
              Paste a system prompt or query to see how compression reduces token count without
              losing meaning.
            </p>
          </div>
        </div>
        <div className="toolkit-split">
          <div>
            <label>
              Input prompt
              <textarea
                className="toolkit-textarea"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                rows={6}
              />
            </label>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
                ~{Math.ceil(promptInput.length / 4)} tokens ({promptInput.length} chars)
              </span>
              <button
                className="download-btn primary"
                onClick={() => setCompressionResult(compressPrompt(promptInput))}
              >
                <Zap size={14} /> Compress
              </button>
            </div>
          </div>
          <div>
            {compressionResult ? (
              <>
                <label>
                  Compressed output
                  <textarea
                    className="toolkit-textarea compressed"
                    value={compressionResult.compressed}
                    readOnly
                    rows={6}
                  />
                </label>
                <div className="compression-stats">
                  <div className="compression-stat">
                    <strong>{compressionResult.savingsPercent.toFixed(1)}%</strong>
                    <span>reduction</span>
                  </div>
                  <div className="compression-stat">
                    <strong>
                      {compressionResult.originalLength - compressionResult.compressedLength}
                    </strong>
                    <span>chars saved</span>
                  </div>
                  <div className="compression-stat">
                    <strong>~{Math.ceil(compressionResult.compressedLength / 4)}</strong>
                    <span>tokens after</span>
                  </div>
                </div>
                {compressionResult.changes.length > 0 && (
                  <div className="compression-changes">
                    {compressionResult.changes.map((change, i) => (
                      <div key={i}>✓ {change}</div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="toolkit-placeholder">
                <Zap size={32} />
                <p>Click "Compress" to see the optimized version of your prompt.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="toolkit-panel">
        <div className="toolkit-panel-header">
          <LineChart size={20} />
          <div>
            <h3>Model Cost Comparator</h3>
            <p>Compare monthly costs across all major models for your workload parameters.</p>
          </div>
        </div>
        <div className="comparator-controls">
          <label>
            Input tokens / request
            <input
              type="number"
              value={compInputTokens}
              onChange={(e) => setCompInputTokens(Number(e.target.value))}
            />
          </label>
          <label>
            Output tokens / request
            <input
              type="number"
              value={compOutputTokens}
              onChange={(e) => setCompOutputTokens(Number(e.target.value))}
            />
          </label>
          <label>
            Daily requests
            <input
              type="number"
              value={compDailyRequests}
              onChange={(e) => setCompDailyRequests(Number(e.target.value))}
            />
          </label>
        </div>
        <div className="comparator-table">
          <div className="comparator-header">
            <span>Model</span>
            <span>Input rate</span>
            <span>Output rate</span>
            <span>Cost/request</span>
            <span>Monthly cost</span>
            <span>vs. cheapest</span>
          </div>
          {comparisonData.map((model, i) => {
            const multiplier =
              cheapest.monthlyCost > 0 ? model.monthlyCost / cheapest.monthlyCost : 1;
            const barWidth =
              mostExpensive.monthlyCost > 0
                ? (model.monthlyCost / mostExpensive.monthlyCost) * 100
                : 0;
            return (
              <div className={`comparator-row ${i === 0 ? "cheapest" : ""}`} key={model.name}>
                <span className="comparator-model">
                  {i === 0 && "🏆 "}
                  {model.name}
                </span>
                <span>${model.inputRate}/1M</span>
                <span>${model.outputRate}/1M</span>
                <span>${model.costPerRequest.toFixed(6)}</span>
                <span className="comparator-cost">
                  ${model.monthlyCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  <span className="comparator-bar" style={{ width: `${barWidth}%` }} />
                </span>
                <span className="comparator-mult">{multiplier.toFixed(1)}x</span>
              </div>
            );
          })}
        </div>
        {cheapest && mostExpensive && cheapest.name !== mostExpensive.name && (
          <div className="executive-note">
            Routing from {mostExpensive.name} to {cheapest.name} would save $
            {(mostExpensive.monthlyCost - cheapest.monthlyCost).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
            /month ({((1 - cheapest.monthlyCost / mostExpensive.monthlyCost) * 100).toFixed(0)}%
            reduction) at {compDailyRequests.toLocaleString()} daily requests.
          </div>
        )}
      </div>

      <div className="toolkit-panel">
        <div className="toolkit-panel-header">
          <Code2 size={20} />
          <div>
            <h3>Reference Implementation</h3>
            <p>Download starter source files for building your own TokenOps infrastructure.</p>
          </div>
        </div>
        <div className="section-grid three">
          {[
            {
              title: "Database Schema",
              desc: "PostgreSQL tables for usage logging, teams, and budgets.",
              file: "supabase-schema.sql",
              format: "SQL",
            },
            {
              title: "Budget Guardrails",
              desc: "YAML config for token budget enforcement with alerts.",
              file: "budget-guardrails.yaml",
              format: "YAML",
            },
            {
              title: "Tagging Schema",
              desc: "LLM gateway configuration with metadata tagging.",
              file: "request-tagging-schema.yaml",
              format: "YAML",
            },
          ].map((item) => (
            <article
              className="tile"
              key={item.title}
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
            >
              <Database size={20} />
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <button
                className="download-btn"
                style={{ marginTop: "auto", alignSelf: "flex-start" }}
                onClick={() => downloadTemplate(item.file)}
              >
                <Download size={14} /> {item.format}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
