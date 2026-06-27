type Filter = "ALL" | "DDD" | "TATA";

interface Props {
  value: Filter;
  onChange: (f: Filter) => void;
}

const items: { id: Filter; label: string }[] = [
  { id: "ALL", label: "Tous" },
  { id: "DDD", label: "DDD" },
  { id: "TATA", label: "TATA" },
];

export const FilterChips = ({ value, onChange }: Props) => {
  return (
    <div className="flex gap-2">
      {items.map((it) => {
        const active = value === it.id;
        const base =
          "relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border";
        let cls = "border-border bg-card text-foreground hover:border-muted-foreground/40";
        if (active && it.id === "DDD")
          cls = "border-transparent bg-gradient-ddd text-ddd-foreground shadow-card";
        else if (active && it.id === "TATA")
          cls = "border-transparent bg-gradient-tata text-tata-foreground shadow-card";
        else if (active && it.id === "ALL")
          cls = "border-transparent bg-foreground text-background shadow-card";
        return (
          <button key={it.id} onClick={() => onChange(it.id)} className={`${base} ${cls}`}>
            {it.label}
          </button>
        );
      })}
    </div>
  );
};

export type { Filter };
