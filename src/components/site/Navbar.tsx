import { Link } from "@tanstack/react-router";
import { Sparkles, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const nav = [
  { label: "Home", to: "/" },
  { label: "Features", to: "/#features" },
  { label: "How It Works", to: "/#how" },
  { label: "About", to: "/#about" },
  { label: "Contact", to: "/#contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    // Call handler right away in case page is already scrolled on mount
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? "bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm" 
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="grid h-10 w-10 place-items-center rounded-xl gradient-brand shadow-glow transition-transform group-hover:scale-105">
              <Sparkles className="h-5.5 w-5.5 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-bold tracking-tight">CareerPilot<span className="text-gradient"> AI</span></span>
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            {nav.map((n) => (
              <a 
                key={n.label} 
                href={n.to} 
                className="rounded-lg px-4 py-2 text-base font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground"
              >
                {n.label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Link to="/login">
              <Button variant="ghost" className="font-medium text-base px-4 py-2">
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="gradient-brand text-white shadow-glow font-medium text-base px-4 py-2">
                Register
              </Button>
            </Link>
          </div>
          <button 
            onClick={() => setOpen(!open)} 
            className="rounded-lg p-2 md:hidden hover:bg-accent transition-colors" 
            aria-label="menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {open && (
          <div className="border-t border-border/40 py-4 flex flex-col gap-1 md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {nav.map((n) => (
              <a 
                key={n.label} 
                href={n.to} 
                onClick={() => setOpen(false)} 
                className="rounded-lg px-3 py-2 text-base font-medium hover:bg-accent transition-colors"
              >
                {n.label}
              </a>
            ))}
            <div className="mt-4 flex flex-col gap-2 pt-4 border-t border-border/40">
              <Link to="/login" className="w-full" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full justify-center text-base">
                  Login
                </Button>
              </Link>
              <Link to="/signup" className="w-full" onClick={() => setOpen(false)}>
                <Button className="w-full gradient-brand text-white shadow-glow justify-center text-base">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

