import { useEffect, useRef, useState } from "react";
import { MapPin, Search, X } from "lucide-react";
import { ALL_PLACES } from "@/data/lines";

interface Props {
  query: string;
  onChange: (q: string) => void;
  onSelect: (place: string) => void;
}

export const SearchBar = ({ query, onChange, onSelect }: Props) => {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const suggestions = query.trim()
    ? ALL_PLACES.filter((p) => p.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : ALL_PLACES.slice(0, 6);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div
        className={`flex items-center gap-3 rounded-2xl border bg-card px-4 py-3.5 transition-all duration-200 ${
          focused
            ? "border-accent ring-focus"
            : "border-border hover:border-muted-foreground/30"
        }`}
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-accent/10 text-accent">
          <MapPin className="h-4 w-4" strokeWidth={2.5} />
        </span>
        <input
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setFocused(true);
            setOpen(true);
          }}
          onBlur={() => setFocused(false)}
          placeholder="Où allez-vous ?"
          className="flex-1 bg-transparent text-base font-medium text-foreground placeholder:font-normal placeholder:text-muted-foreground focus:outline-none"
        />
        {query && (
          <button
            onClick={() => onChange("")}
            className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-muted"
            aria-label="Effacer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 animate-fade-up overflow-hidden rounded-2xl border border-border bg-popover shadow-card">
          <div className="px-4 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Suggestions
          </div>
          {suggestions.map((s) => (
            <button
              key={s}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(s);
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-muted text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
              </span>
              <span className="font-medium text-foreground">{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
