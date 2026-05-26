import { Github, Linkedin, Twitter, Mail, Heart } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-[#2a2c33] bg-black/30">
      <div className="mx-auto max-w-[1200px] px-4 py-10">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-[#0b0b0d]"
              style={{ background: "linear-gradient(135deg,#a07a17,#d4af37,#f0d278)" }}
            >
              TO
            </span>
            <div>
              <p className="text-sm font-semibold tracking-wider text-[#f5f1e6]" style={{ fontFamily: "'Playfair Display', serif" }}>
                TOKENOPS ATLAS
              </p>
              <p className="text-xs text-[#9aa0aa]">FinOps for LLM token consumption</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Social href="https://github.com/kalilurrahman" label="GitHub"><Github className="h-4 w-4" /></Social>
            <Social href="https://linkedin.com/in/kalilurrahman" label="LinkedIn"><Linkedin className="h-4 w-4" /></Social>
            <Social href="https://twitter.com/krahman" label="Twitter"><Twitter className="h-4 w-4" /></Social>
            <Social href="mailto:kalilur_r@outlook.com" label="Email"><Mail className="h-4 w-4" /></Social>
          </div>

          <div className="text-center text-xs text-[#9aa0aa] md:text-right">
            <p>
              Made with <Heart className="inline h-3 w-3 fill-[#d4af37] text-[#d4af37]" /> by Kalilur Rahman
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
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2a2c33] text-[#9aa0aa] transition-all hover:border-[#d4af37] hover:text-[#d4af37]"
    >
      {children}
    </a>
  );
}