import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Download, ExternalLink, GraduationCap } from "lucide-react";
import {
  COURSE_SITE,
  fetchCourses,
  formatBytes,
  moduleAvailability,
  moduleHtmlUrl,
  offlineFileName,
  recordEvent,
  type Course,
  type CourseModule,
} from "@/lib/courseForge";

// /training — TokenOps' interactive courses, generated in the OpenMAIC studio and stored by
// course-forge (site key "tokenops"). A lesson is one self-contained HTML file framed with
// sandbox="allow-scripts" only (never allow-same-origin), so it runs its simulation and quiz but
// cannot read this page's storage. Nothing AI-generated plays before a human review unless the
// deployment opts in with VITE_COURSE_SHOW_DRAFTS=1, and then it carries a visible draft note.

export const Route = createFileRoute("/training")({
  validateSearch: (search: Record<string, unknown>) => ({
    course: typeof search["course"] === "string" ? search["course"] : undefined,
    module: typeof search["module"] === "string" ? search["module"] : undefined,
  }),
  component: TrainingPage,
  head: () => ({
    meta: [
      { title: "Training — TokenOps Atlas" },
      {
        name: "description",
        content:
          "Short interactive TokenOps courses: a cost-cutting decision simulation, a knowledge check and a template you leave with. Plays in the browser; downloadable for offline use.",
      },
      { property: "og:title", content: "TokenOps Training" },
      {
        property: "og:description",
        content:
          "Interactive courses on cutting AI token costs without degrading quality. Plays in the browser; downloadable for offline use.",
      },
    ],
  }),
});

type LoadState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; courses: Course[] };

function TrainingPage() {
  const search = useSearch({ from: "/training" });
  const navigate = useNavigate();
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const courseSlug = search.course ?? "";
  const moduleParam = Number(search.module ?? "1");

  useEffect(() => {
    let cancelled = false;
    fetchCourses()
      .then((courses) => {
        if (!cancelled) setState({ kind: "ready", courses });
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setState({ kind: "error", message: e instanceof Error ? e.message : String(e) });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const course = useMemo(
    () =>
      state.kind === "ready" ? (state.courses.find((c) => c.slug === courseSlug) ?? null) : null,
    [state, courseSlug],
  );
  const module = useMemo(
    () => course?.modules.find((m) => m.sequence === moduleParam) ?? course?.modules[0] ?? null,
    [course, moduleParam],
  );

  useEffect(() => {
    if (course && module)
      recordEvent("module_opened", {
        courseId: course.id,
        moduleId: module.id,
        version: module.version,
      });
  }, [course, module]);

  const open = (slug: string) =>
    void navigate({ to: "/training", search: { course: slug, module: "1" } });
  const back = () =>
    void navigate({ to: "/training", search: { course: undefined, module: undefined } });

  return (
    <section className="stack">
      <div className="page-heading">
        <p className="eyebrow">Training</p>
        <h1>{course ? course.title : "Interactive TokenOps courses"}</h1>
        <p>
          {course && module
            ? `Module ${module.sequence}: ${module.title}${module.durationMinutes ? ` · about ${module.durationMinutes} min` : ""}`
            : "Short, practical modules with one decision simulation, one knowledge check and a template you leave with. Each plays in the browser and can be downloaded as a single file for offline use."}
        </p>
      </div>

      {state.kind === "loading" && <p role="status">Loading courses…</p>}
      {state.kind === "error" && (
        <p role="alert" className="hero-copy text-[var(--muted)]">
          The course service did not answer ({state.message}). The rest of TokenOps Atlas is
          unaffected; try again in a minute.
        </p>
      )}
      {state.kind === "ready" && !course && <CourseList courses={state.courses} onOpen={open} />}
      {state.kind === "ready" && course && module && (
        <Player course={course} module={module} onBack={back} />
      )}
      {state.kind === "ready" && (
        <p className="text-xs text-[var(--muted)]">Site key {COURSE_SITE}</p>
      )}
    </section>
  );
}

function badge(availability: ReturnType<typeof moduleAvailability>): string {
  if (availability.kind === "approved") return "Reviewed";
  if (availability.kind === "generating") return "Generating";
  return "Draft · in review";
}

function CourseList({ courses, onOpen }: { courses: Course[]; onOpen: (slug: string) => void }) {
  if (courses.length === 0) return <p>No courses are listed for this site yet.</p>;
  return (
    <div className="section-grid two">
      {courses.map((c) => {
        const first = c.modules[0];
        const availability = first ? moduleAvailability(first) : ({ kind: "generating" } as const);
        const playable = "playable" in availability && availability.playable;
        return (
          <article className="resource-card" key={c.id}>
            <div className="resource-card-header">
              <div className="resource-card-icon">
                <GraduationCap size={22} />
              </div>
              <div>
                <h3>{c.title}</h3>
                {c.outcome && <p>{c.outcome}</p>}
              </div>
            </div>
            {c.primaryInteraction && (
              <p className="mt-3 text-sm">
                <strong>Practice:</strong> {c.primaryInteraction}
              </p>
            )}
            {c.deliverable && (
              <p className="mt-1 text-sm">
                <strong>You leave with:</strong> {c.deliverable}
              </p>
            )}
            <div className="resource-card-footer">
              <span className="badge badge-guide">{badge(availability)}</span>
              {first?.durationMinutes ? (
                <span className="text-xs text-[var(--muted)]">about {first.durationMinutes} min</span>
              ) : null}
              <button
                type="button"
                className="to-btn-gold ml-auto inline-flex items-center gap-1.5 text-xs"
                disabled={!playable}
                onClick={() => onOpen(c.slug)}
              >
                {availability.kind === "generating"
                  ? "Being generated"
                  : playable
                    ? "Start"
                    : "In review"}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function Player({
  course,
  module,
  onBack,
}: {
  course: Course;
  module: CourseModule;
  onBack: () => void;
}) {
  const availability = moduleAvailability(module);
  const src = moduleHtmlUrl(module);
  const playable = Boolean(src) && "playable" in availability && availability.playable;
  return (
    <article aria-label={`${course.title}, module ${module.sequence}`} className="stack">
      <p>
        <button
          type="button"
          className="to-btn-gold inline-flex items-center gap-1.5 text-xs"
          onClick={onBack}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All courses
        </button>
      </p>
      {availability.kind !== "approved" && (
        <p role="note" className="hero-copy text-[var(--muted)]">
          Draft. This module was generated with AI assistance and has not yet been reviewed by a
          subject expert. Treat its content as a starting point, not as advice.
        </p>
      )}
      {playable && src ? (
        <iframe
          title={`${course.title} — ${module.title}`}
          src={src}
          sandbox="allow-scripts"
          loading="lazy"
          style={{
            width: "100%",
            aspectRatio: "16 / 9",
            minHeight: "28rem",
            border: "1px solid var(--line)",
            borderRadius: "0.75rem",
            background: "#000",
          }}
        />
      ) : (
        <p>This module is not available to play yet.</p>
      )}
      <p className="flex flex-wrap items-center gap-4 text-sm">
        {playable && src && (
          <>
            <a
              href={src}
              download={offlineFileName(course, module)}
              className="inline-flex items-center gap-1.5 hover:underline"
              onClick={() =>
                recordEvent("offline_download", {
                  courseId: course.id,
                  moduleId: module.id,
                  version: module.version,
                })
              }
            >
              <Download className="h-3.5 w-3.5" />
              Download for offline use{module.bytes ? ` (${formatBytes(module.bytes)})` : ""}
            </a>
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open full screen
            </a>
          </>
        )}
        {module.sha256 && (
          <span className="text-xs text-[var(--muted)]">
            version {module.version} · sha256 {module.sha256.slice(0, 12)}…
          </span>
        )}
        {module.review?.reviewer && module.review.reviewedOn && (
          <span className="text-xs text-[var(--muted)]">
            Reviewed by {module.review.reviewer} on {module.review.reviewedOn}
          </span>
        )}
      </p>
    </article>
  );
}
