const navStatusLabels: Record<number, string> = {
  0: "Under way using engine",
  1: "At anchor",
  2: "Not under command",
  3: "Restricted maneuverability",
  4: "Constrained by draught",
  5: "Moored",
  6: "Aground",
  7: "Fishing",
  8: "Sailing",
  9: "Reserved",
  10: "Reserved",
  11: "Towing",
  12: "Pushing",
  13: "Reserved",
  14: "AIS-SART",
  15: "Not defined",
};

export function getNavStatusLabel(code: number): string {
  return navStatusLabels[code] ?? `Unknown (${code})`;
}
