import { Link } from "@tanstack/react-router";
import { BookOpen, Download, FileText } from "lucide-react";
import {
  categoryIconClass,
  downloadTemplate,
  formatBadgeClass,
  formatIcons,
  type ResourceItem,
} from "@/tokenops/data";

export function ResourceCard({ item }: { item: ResourceItem }) {
  const FormatIcon = formatIcons[item.format] ?? FileText;
  const badgeClass = formatBadgeClass[item.format] ?? "badge-md";
  const iconClass = categoryIconClass[item.category] ?? "";
  const isPdf = item.format === "PDF" && item.file;

  return (
    <article className="resource-card">
      <div className="resource-card-header">
        <div className={`resource-card-icon ${iconClass}`}>
          <FormatIcon size={22} />
        </div>
        <div>
          <h3>{item.title}</h3>
          <p>{item.desc}</p>
        </div>
      </div>
      <div className="resource-card-footer">
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className={`badge ${badgeClass}`}>{item.format}</span>
          <span className="category-tag">{item.category}</span>
        </div>
        {item.file && !isPdf && (
          <div className="resource-card-actions">
            <Link
              className="download-btn"
              to="/read/$"
              params={{ _splat: `template/${item.file}` }}
            >
              <BookOpen size={15} /> Read
            </Link>
            <button className="download-btn" onClick={() => downloadTemplate(item.file!)}>
              <Download size={15} /> Download
            </button>
          </div>
        )}
        {isPdf && (
          <a className="download-btn" href={`/templates/${item.file}`} download>
            <Download size={15} /> Download PDF
          </a>
        )}
        {item.file === null && (
          <Link className="download-btn" to="/guide" style={{ textDecoration: "none" }}>
            <BookOpen size={15} /> Read in Guide
          </Link>
        )}
      </div>
    </article>
  );
}
