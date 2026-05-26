import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, FolderDown, Gauge, LineChart, Target, Zap } from "lucide-react";

const features = [
  { icon: BookOpen, title: "Comprehensive Guide", desc: "45,000-word operating manual covering foundations, framework, implementation, and governance.", to: "/guide" },
  { icon: LineChart, title: "Savings Calculator", desc: "Model the impact of caching, routing, batching, and implementation cost on your token spend.", to: "/calculator" },
  { icon: Gauge, title: "Operational Dashboard", desc: "Visibility into spend trends, team allocation, model costs, yield rates, and anomalies.", to: "/dashboard" },
  { icon: Zap, title: "Interactive Toolkit", desc: "Live prompt compressor, model cost comparator, and reference implementation downloads.", to: "/toolkit" },
  { icon: FolderDown, title: "Resources & Templates", desc: "Downloadable documents, checklists, schemas, and starter configs for your team.", to: "/resources" },
  { icon: Target, title: "Unit Economics", desc: "Metrics frameworks for engineering, finance, and product to connect cost to business impact.", to: "/guide" },
] as const;

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About — TokenOps Atlas" },
      { name: "description", content: "The open reference for teams applying FinOps discipline to LLM token consumption." },
    ],
  }),
});

function AboutPage() {
  return (
    <section className="stack">
      <div className="about-hero">
        <div>
          <p className="eyebrow">About TokenOps Atlas</p>
          <h1>Turn AI cost into an engineered system.</h1>
          <p className="about-hero-desc">
            TokenOps Atlas is the open reference for teams applying FinOps discipline to LLM token consumption.
            It combines a practical guide, interactive tools, and governance templates so engineering, finance,
            product, and leadership can work from the same operating picture.
          </p>
        </div>
        <div className="about-stats">
          <div className="about-stat"><strong>45K+</strong><span>Words of guidance</span></div>
          <div className="about-stat"><strong>12</strong><span>Downloadable resources</span></div>
          <div className="about-stat"><strong>7</strong><span>Optimization patterns</span></div>
          <div className="about-stat"><strong>5</strong><span>Interactive tools</span></div>
        </div>
      </div>

      <div className="about-features">
        {features.map(({ icon: Icon, title, desc, to }) => (
          <Link className="about-feature-card" to={to} key={title}>
            <Icon size={22} />
            <h3>{title}</h3>
            <p>{desc}</p>
            <ArrowRight size={16} className="card-arrow" />
          </Link>
        ))}
      </div>

      <div className="about-cta">
        <h2>Ready to get started?</h2>
        <p>Begin with a baseline audit, deploy instrumentation, and start optimizing in weeks.</p>
        <div className="about-cta-actions">
          <Link className="primary-action button-action" to="/resources">
            <FolderDown size={17} /> Download Starter Kit
          </Link>
          <Link className="primary-action" to="/guide" style={{ border: "1px solid var(--line)" }}>
            <BookOpen size={17} /> Read the Guide
          </Link>
        </div>
      </div>
    </section>
  );
}