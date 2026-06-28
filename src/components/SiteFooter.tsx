import { Github, Linkedin, Twitter, Mail, Heart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { TokenOpsLogo } from "@/components/TokenOpsLogo";

export function SiteFooter() {
  return (
    <footer className="site-footer mt-12 border-t">
      <div className="mx-auto max-w-[1200px] px-4 py-10">
        <nav className="footer-muted mb-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
          <Link to="/optimize" className="hover:underline">Optimize</Link>
          <Link to="/techniques" className="hover:underline">Techniques</Link>
          <Link to="/tool-guides" className="hover:underline">Tool Guides</Link>
          <Link to="/caveman" className="hover:underline">Caveman</Link>
          <Link to="/prompt-templates" className="hover:underline">Prompt Templates</Link>
          <Link to="/calculator" className="hover:underline">Calculator</Link>
          <Link to="/library" className="hover:underline">Library</Link>
        </nav>
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <TokenOpsLogo size={36} showWordmark showTagline />

          <div className="flex items-center gap-3">
            <Social href="https://github.com/kalilurrahman" label="GitHub">
              <Github className="h-4 w-4" />
            </Social>
            <Social href="https://linkedin.com/in/kalilurrahman" label="LinkedIn">
              <Linkedin className="h-4 w-4" />
            </Social>
            <Social href="https://twitter.com/krahman" label="Twitter">
              <Twitter className="h-4 w-4" />
            </Social>
            <Social href="mailto:kalilur_r@outlook.com" label="Email">
              <Mail className="h-4 w-4" />
            </Social>
          </div>

          <div className="footer-muted text-center text-xs md:text-right">
            <p>
              Made with <Heart className="footer-heart inline h-3 w-3" /> by Kalilur Rahman
            </p>
            <p className="mt-1">
              © {new Date().getFullYear()} TokenOps Atlas — All rights reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Social({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
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
