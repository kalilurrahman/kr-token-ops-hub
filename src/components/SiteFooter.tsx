import { CalendarCheck, Github, Linkedin, Twitter, Mail, Heart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ReviewCta } from "@/components/ReviewCta";
import { TokenOpsLogo } from "@/components/TokenOpsLogo";
import { RELEASE_LABEL, RELEASE_VERSION } from "@/lib/release";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-grid">
          <div className="site-footer-brand">
            <TokenOpsLogo size={36} showWordmark showTagline />
            <div className="site-footer-social">
              <Social href="https://github.com/kalilurrahman" label="GitHub">
                <Github size={16} strokeWidth={1.75} />
              </Social>
              <Social href="https://linkedin.com/in/kalilurrahman" label="LinkedIn">
                <Linkedin size={16} strokeWidth={1.75} />
              </Social>
              <Social href="https://twitter.com/krahman" label="Twitter">
                <Twitter size={16} strokeWidth={1.75} />
              </Social>
              <Social href="mailto:kalilur_r@outlook.com" label="Email">
                <Mail size={16} strokeWidth={1.75} />
              </Social>
            </div>
            <ReviewCta
              className="to-btn-gold site-footer-cta"
              before={<CalendarCheck size={16} strokeWidth={1.75} aria-hidden="true" />}
            />
          </div>

          <nav className="site-footer-nav" aria-label="Footer">
            <FooterColumn title="Optimize">
              <Link to="/optimize">Optimize</Link>
              <Link to="/techniques">Techniques</Link>
              <Link to="/tool-guides">Tool Guides</Link>
              <Link to="/caveman">Caveman</Link>
              <Link to="/prompt-templates">Prompt Templates</Link>
            </FooterColumn>
            <FooterColumn title="Tools">
              <Link to="/models">Models</Link>
              <Link to="/calculator">Calculator</Link>
            </FooterColumn>
            <FooterColumn title="Read">
              <Link to="/library">Library</Link>
              <Link to="/reading-lists">Reading Lists</Link>
              <Link to="/sample-chapter">Free Chapter</Link>
            </FooterColumn>
            <FooterColumn title="Learn">
              <Link to="/training" search={{ course: undefined, module: undefined }}>
                Training
              </Link>
            </FooterColumn>
          </nav>
        </div>

        <div className="site-footer-legal footer-muted">
          <p>
            Made with <Heart className="footer-heart inline h-3 w-3" aria-hidden="true" /> by
            Kalilur Rahman
          </p>
          <div className="site-footer-legal-end">
            <p>© {new Date().getFullYear()} TokenOps Atlas — All rights reserved</p>
            <Link
              to="/changelog"
              hash={`v${RELEASE_VERSION}`}
              className="to-release"
              title={`TokenOps Atlas release ${RELEASE_LABEL}: see what changed`}
            >
              <span className="sr-only">Release </span>
              {RELEASE_LABEL}
              <span className="sr-only">, release notes</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="site-footer-col">
      <p className="to-eyebrow">{title}</p>
      <div className="site-footer-links">{children}</div>
    </div>
  );
}

function Social({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="social-link"
    >
      {children}
    </a>
  );
}
