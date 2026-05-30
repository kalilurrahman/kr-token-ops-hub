import { Github, Linkedin, Twitter, Mail, Heart } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="site-footer mt-12 border-t">
      <div className="mx-auto max-w-[1200px] px-4 py-10">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="flex items-center gap-3">
            <span className="brand-mark flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold">
              TO
            </span>
            <div>
              <p className="brand-wordmark text-sm font-semibold tracking-wider">
                TOKENOPS ATLAS
              </p>
              <p className="footer-muted text-xs">FinOps for LLM token consumption</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Social href="https://github.com/kalilurrahman" label="GitHub"><Github className="h-4 w-4" /></Social>
            <Social href="https://linkedin.com/in/kalilurrahman" label="LinkedIn"><Linkedin className="h-4 w-4" /></Social>
            <Social href="https://twitter.com/krahman" label="Twitter"><Twitter className="h-4 w-4" /></Social>
            <Social href="mailto:kalilur_r@outlook.com" label="Email"><Mail className="h-4 w-4" /></Social>
          </div>

          <div className="footer-muted text-center text-xs md:text-right">
            <p>
              Made with <Heart className="footer-heart inline h-3 w-3" /> by Kalilur Rahman
            </p>
            <p className="mt-1">© {new Date().getFullYear()} TokenOps Atlas — All rights reserved</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Social({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="social-link flex h-9 w-9 items-center justify-center rounded-lg border transition-all"
    >
      {children}
    </a>
  );
}