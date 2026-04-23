export type BusType = "DDD" | "TATA";

export interface BusLine {
  id: string;
  number: string;
  type: BusType;
  from: string;
  to: string;
  stops: string[];
  duration: string;
  frequency: string;
  price: number;
}

export const BUS_LINES: BusLine[] = [
  {
    id: "ddd-1",
    number: "1",
    type: "DDD",
    from: "Petersen",
    to: "Yoff Apecsy",
    stops: ["Petersen", "Sandaga", "Liberté 6", "Mermoz", "Yoff Apecsy"],
    duration: "55 min",
    frequency: "8 min",
    price: 175,
  }
];

export const ALL_PLACES = Array.from(
  new Set(BUS_LINES.flatMap((l) => [l.from, l.to, ...l.stops]))
).sort();