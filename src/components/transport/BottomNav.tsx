import { Heart, Home, Map, User } from "lucide-react";

type Tab = "home" | "map" | "favorites" | "profile";

interface Props {
  active: Tab;
  onChange: (t: Tab) => void;
  favoritesCount: number;
}

const tabs: { id: Tab; label: string; Icon: typeof Home }[] = [
  { id: "home", label: "Accueil", Icon: Home },
  { id: "map", label: "Carte", Icon: Map },
  { id: "favorites", label: "Favoris", Icon: Heart },
  { id: "profile", label: "Profil", Icon: User },
];

export const BottomNav = ({ active, onChange, favoritesCount }: Props) => {
  return (
    <nav className="sticky bottom-0 left-0 right-0 z-20 border-t border-border bg-card/85 backdrop-blur-xl">
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
        {tabs.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <li key={id} className="flex-1">
              <button
                onClick={() => onChange(id)}
                className={`relative flex w-full flex-col items-center gap-0.5 px-2 py-1.5 transition-colors ${
                  isActive ? "text-accent" : "text-muted-foreground"
                }`}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                  {id === "favorites" && favoritesCount > 0 && (
                    <span className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                      {favoritesCount}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-semibold">{label}</span>
                <span
                  key={isActive ? "on" : "off"}
                  className={`absolute -bottom-0.5 h-[3px] w-8 origin-center rounded-full bg-accent ${
                    isActive ? "animate-underline-grow" : "scale-x-0 opacity-0"
                  }`}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export type { Tab };
