// Seed data extracted from the two PDFs:
//   - 32 Princess Renovation - Remaining Costs (Materials Only)
//   - 32 Princess Renovation - To-Do List
// Date extracted: 2026-07-11

export type CostLine = {
  id: string;
  category: string;
  item: string;
  scope: string;
  qty: number | null;
  unit: string;
  lowUnit: number | null;
  highUnit: number | null;
  lowTotal: number | null;
  highTotal: number | null;
  status: "Measured" | "Allowance" | "Estimate" | "Open" | "Verified" | "Leave blank per Ry";
  notes: string;
  // Actual cost fields populated by user
  actualAmount: number | null;
  actualDate: string; // ISO YYYY-MM-DD
  actualVendor: string;
  actualNotes: string;
};

export type TodoStatus = "not_started" | "in_progress" | "blocked" | "done";

export type TodoLine = {
  id: string;
  stage: string;
  task: string;
  owner: string; // free-text — seed with PDFs' owners
  status: TodoStatus;
  targetDate: string; // ISO date or ""
  materialsRef: string;
  notes: string;
  costLineId?: string; // optional pointer to a cost row
};

export type DashboardData = {
  meta: {
    projectName: string;
    address: string;
    lastUpdated: string;
    subtotalNote: string;
    drawingNotes: string[];
  };
  costs: CostLine[];
  todos: TodoLine[];
};

// ---------- COSTS (transcribed from 32-princess-renovation-remaining-costs.pdf) ----------
const c = (
  id: string,
  category: string,
  item: string,
  scope: string,
  qty: number | null,
  unit: string,
  lowUnit: number | null,
  highUnit: number | null,
  lowTotal: number | null,
  highTotal: number | null,
  status: CostLine["status"],
  notes: string
): CostLine => ({
  id,
  category,
  item,
  scope,
  qty,
  unit,
  lowUnit,
  highUnit,
  lowTotal,
  highTotal,
  status,
  notes,
  actualAmount: null,
  actualDate: "",
  actualVendor: "",
  actualNotes: "",
});

export const SEED_DATA: DashboardData = {
  meta: {
    projectName: "32 Princess Renovation",
    address: "32 Princess St, Orangeville, ON",
    lastUpdated: "2026-07-11",
    subtotalNote:
      "Filled material estimate subtotal range: $34,235 – $68,130. Open / TBD rows not included.",
    drawingNotes: [
      "A1.04 — New First Floor, JSR Engineering, 2025-10-20",
      "A1.06 — New Elevations, JSR Engineering, 2025-10-20",
      "Scale notes: 1/4 in = 1 ft (plan), 1/8 in = 1 ft (elevations)",
    ],
  },
  costs: [
    c(
      "ctx-floor",
      "Context",
      "NEW portion floor area (A1.04)",
      "Three new rooms: 14×13, 13×13, 11×13 ft",
      494,
      "sq ft",
      null,
      null,
      null,
      null,
      "Measured",
      "Subfloor + drywall scope per Ry. Existing main floor excluded."
    ),
    c(
      "ctx-openings",
      "Context",
      "NEW door + window count (A1.04)",
      "Door and window openings on new first-floor plan",
      15,
      "openings",
      null,
      null,
      null,
      null,
      "Measured",
      "8 interior doors, 2 exterior doors, 7 windows. Siding takeoff uses A1.06 exposed-face areas."
    ),
    c(
      "sub-plywood",
      "Subfloor",
      "3/4 inch plywood subfloor — new portion",
      "Over new 2×10 PTW joists @ 16 in O.C.",
      18,
      "sheets (4×8)",
      null,
      null,
      700,
      1000,
      "Measured",
      "494 sq ft × 1.08 waste / 32 sq ft per sheet = ~17 sheets, round to 18. ~$35–$55/sheet installed-equivalent."
    ),
    c(
      "sub-adhesive",
      "Subfloor",
      "Subfloor adhesive + screws",
      "Construction adhesive and coated screws for 3/4 in plywood",
      1,
      "allowance",
      null,
      null,
      75,
      120,
      "Allowance",
      "Standard subfloor adhesive + coated screw allowance for ~18 sheets."
    ),
    c(
      "dry-board",
      "Drywall",
      "Drywall board — new portion",
      "Drywall for ceilings, new exterior walls, and interior partitions",
      53,
      "sheets (4×8)",
      null,
      null,
      1100,
      1700,
      "Measured",
      "Ceiling 494 sq ft + exterior walls ~800 sq ft (10% door/window deduction) + interior partitions ~416 sq ft both sides ≈ 1,540 net sq ft. ~53 sheets with 10% waste. ~$20–$32/sheet."
    ),
    c(
      "dry-finish",
      "Drywall",
      "Mud, tape, corner bead, screws",
      "Drywall finishing materials",
      1,
      "allowance",
      null,
      null,
      250,
      400,
      "Allowance",
      "Joint compound, paper tape, metal corner bead, drywall screws for ~53 sheets."
    ),
    c(
      "ins-ceiling",
      "Insulation",
      "Ceiling insulation — new portion",
      "Batt/blown ceiling insulation",
      494,
      "sq ft",
      null,
      null,
      400,
      700,
      "Allowance",
      "R-value TBD. Batt typical $0.85–$1.50/sq ft installed-equivalent."
    ),
    c(
      "roof-blank",
      "Roof",
      "Roofing materials",
      "Roofing for framed addition — TBD",
      null,
      "package",
      null,
      null,
      null,
      null,
      "Leave blank per Ry",
      "Ry's roof numbers coming tomorrow; intentionally blank. Labour tracked separately."
    ),
    c(
      "ext-siding",
      "Exterior",
      "Siding materials — new portion",
      "Siding/cladding for new exterior walls",
      1261,
      "sq ft (with waste)",
      null,
      null,
      3000,
      6500,
      "Measured",
      "A1.06 exposed faces: 56.72 + 56.72 = 113.44 sqm (1,221 sq ft). Net siding 1,146 sq ft; +10–15% waste = 1,261–1,318 sq ft. ~$2.40–$5.15/sq ft materials."
    ),
    c(
      "flr-main",
      "Flooring",
      "Main-floor flooring materials",
      "Flooring for the entire main floor (existing + new)",
      1800,
      "sq ft",
      2.0,
      3.0,
      3600,
      5400,
      "Estimate",
      "Ry-provided assumption: $2–$3 per sq ft. New portion (~494 sq ft) is a subset."
    ),
    c(
      "dr-slabs",
      "Interior doors",
      "Interior door slabs — new portion",
      "Eight interior door slabs",
      8,
      "doors",
      null,
      null,
      1600,
      3200,
      "Measured",
      "4× 28×80 passage, 1× 32×80 ensuite entry, 1× 36×80 bedroom, 1× 18×80 closet, 1× 47×80 pocket. $200–$400 installed-equivalent."
    ),
    c(
      "dr-hw",
      "Interior doors",
      "Interior door hardware — new portion",
      "Hinges, knobs/locks, accessories",
      8,
      "sets",
      null,
      null,
      300,
      600,
      "Allowance",
      "Standard hardware kits $40–$75 per door."
    ),
    c(
      "tr-base",
      "Trim / baseboard",
      "Baseboard — supply",
      "Baseboard for the new portion",
      252,
      "lin ft",
      null,
      null,
      380,
      630,
      "Measured",
      "~200 ft perimeter + ~52 ft double-sided interior partition. Mid-range $1.50–$2.50 per LF."
    ),
    c(
      "tr-case",
      "Trim / baseboard",
      "Casing — supply",
      "Door and window casing for the new portion",
      15,
      "openings",
      null,
      null,
      180,
      380,
      "Measured",
      "About 15 door/window openings, budgeted at $12–$25 per opening for casing kits."
    ),
    c(
      "paint",
      "Paint",
      "Paint / primer / supplies — new portion",
      "Paint, primer, sundries for the new portion",
      1,
      "allowance",
      null,
      null,
      300,
      600,
      "Allowance",
      "Existing main floor primed per Ry. New portion: addition walls, ceiling, and touch-ups."
    ),
    c(
      "bath-ensuite",
      "Bath fixtures",
      "Primary ensuite fixtures + tile",
      "Custom shower, freestanding tub, vanity, toilet, valves, in-floor heat, waterproofing, tile",
      1,
      "package",
      null,
      null,
      12000,
      25000,
      "Measured",
      "A1.04 ensuite 12.61 m² (~135.7 sq ft). Generous budget for custom shower + freestanding tub."
    ),
    c(
      "bath-kenan",
      "Bath fixtures",
      "Kenan 3-piece bath fixtures + tile",
      "Tub/shower combo, vanity, toilet, shower valve, tile",
      1,
      "package",
      null,
      null,
      3500,
      7000,
      "Measured",
      "A1.04 Bath 3.05 m² (~32.8 sq ft) — basic 3-piece."
    ),
    c(
      "bath-powder",
      "Bath fixtures",
      "Powder room fixtures + tile",
      "Toilet, vanity, tile, accessories",
      1,
      "package",
      null,
      null,
      1500,
      3500,
      "Measured",
      "Tight footprint; mid-range placeholder. Confirm whether powder room is in new portion or existing."
    ),
    c(
      "kit-counter",
      "Kitchen",
      "Kitchen countertop starter allowance",
      "Ry/Kenan starter countertop package",
      1,
      "allowance",
      null,
      null,
      1500,
      3000,
      "Measured",
      "Kitchen 30.18 m² (~324.8 sq ft) per A1.04. Countertop sf still TBD."
    ),
    c(
      "heat-ensuite",
      "Heated floor",
      "In-floor heat — master ensuite",
      "Electric radiant mat + thermostat",
      50,
      "sq ft",
      null,
      null,
      600,
      1100,
      "Measured",
      "Mat $8–$15/sq ft + thermostat $150–$300. Covers shower zone + vanity area in 12.61 m² ensuite."
    ),
    c(
      "heat-mudroom",
      "Heated floor",
      "In-floor heat — mudroom",
      "Electric radiant mat + thermostat",
      50,
      "sq ft",
      null,
      null,
      600,
      1100,
      "Measured",
      "Mat $8–$15/sq ft + thermostat $150–$300. Covers 5.69 m² mudroom floor zone."
    ),
    c(
      "heat-foyer",
      "Heated floor",
      "In-floor heat — front entrance",
      "Electric radiant mat + thermostat",
      55,
      "sq ft",
      null,
      null,
      650,
      1200,
      "Measured",
      "Mat $8–$15/sq ft + thermostat $150–$300. Covers 6.31 m² foyer."
    ),
    c(
      "hvac",
      "HVAC",
      "HVAC additions / rework",
      "Any HVAC additions or rework for the addition",
      null,
      "package",
      null,
      null,
      null,
      null,
      "Open",
      "Routed to Otto. CSA F280 screening pending FILES COMPLETE — BEGIN REVIEW."
    ),
    c(
      "contingency",
      "Contingency",
      "Contingency allowance",
      "Reserve for unforeseen items and scope creep",
      1,
      "allowance",
      null,
      null,
      2000,
      5000,
      "Allowance",
      "Roughly 10–15% of filled estimates."
    ),
    c(
      "misc-1",
      "Misc",
      "Miscellaneous placeholder 1",
      "Reserve misc line",
      null,
      "line",
      null,
      null,
      null,
      null,
      "Open",
      "Reserve."
    ),
    c(
      "misc-2",
      "Misc",
      "Miscellaneous placeholder 2",
      "Reserve misc line",
      null,
      "line",
      null,
      null,
      null,
      null,
      "Open",
      "Reserve."
    ),
    c(
      "misc-3",
      "Misc",
      "Miscellaneous placeholder 3",
      "Reserve misc line",
      null,
      "line",
      null,
      null,
      null,
      null,
      "Open",
      "Reserve."
    ),
  ],

  // ---------- TODOS (transcribed from ryes-renovation-todo.pdf) ----------
  todos: [
    {
      id: "t-1",
      stage: "Exterior",
      task: "Finish exterior rigid insulation",
      owner: "Ry",
      status: "not_started",
      targetDate: "",
      materialsRef: "See siding line in materials doc",
      notes:
        "Rigid insulation on addition exterior. R-value target TBD. Verify before siding.",
      costLineId: undefined,
    },
    {
      id: "t-2",
      stage: "Exterior",
      task: "Install exterior siding on the addition",
      owner: "Ry",
      status: "not_started",
      targetDate: "",
      materialsRef: "~1,261 sq ft siding (materials only)",
      notes:
        "Materials on hand ~$3,000–$6,500. Labour tracked separately.",
      costLineId: "ext-siding",
    },
    {
      id: "t-3",
      stage: "Exterior",
      task: "Install roof for the addition",
      owner: "Ry",
      status: "not_started",
      targetDate: "",
      materialsRef: "TBD per Ry",
      notes:
        "Roof materials + labour numbers coming. Roof row intentionally blank in cost doc.",
      costLineId: "roof-blank",
    },
    {
      id: "t-4",
      stage: "Ventilation",
      task: "Open up pockets in the ceiling joists in the addition for ventilation",
      owner: "Ry",
      status: "not_started",
      targetDate: "",
      materialsRef: "TBD",
      notes:
        "Ventilation baffles/pockets. Coordinate with insulation + HVAC rough-in order.",
      costLineId: undefined,
    },
    {
      id: "t-5",
      stage: "Subfloor",
      task: "Install subfloor layer in the addition (3/4 in plywood)",
      owner: "Ry",
      status: "not_started",
      targetDate: "",
      materialsRef: "~18 sheets 4×8 + adhesive + screws",
      notes:
        "New portion only: 494 sq ft (14×13 + 13×13 + 11×13).",
      costLineId: "sub-plywood",
    },
    {
      id: "t-6",
      stage: "Insulation",
      task: "Insulate and install vapour barrier for the addition",
      owner: "Ry",
      status: "not_started",
      targetDate: "",
      materialsRef:
        "Ceiling insulation ~494 sq ft + vapour barrier",
      notes:
        "R-value TBD. Vapour barrier on warm side per OBC.",
      costLineId: "ins-ceiling",
    },
    {
      id: "t-7",
      stage: "Mechanical",
      task: "Rough-in plumbing for all new bathrooms on the main floor",
      owner: "Ry",
      status: "not_started",
      targetDate: "",
      materialsRef: "Primary ensuite, Kenan bath, powder room",
      notes:
        "Owner labour. Connect to main line later in sequence.",
      costLineId: undefined,
    },
    {
      id: "t-8",
      stage: "Mechanical",
      task: "Connect plumbing to the main line",
      owner: "Ry / Otto",
      status: "not_started",
      targetDate: "",
      materialsRef: "—",
      notes: "After rough-in is complete and inspected.",
      costLineId: undefined,
    },
    {
      id: "t-9",
      stage: "Electrical",
      task: "Rough-in wiring for the addition",
      owner: "Ry",
      status: "not_started",
      targetDate: "",
      materialsRef: "Owner labour",
      notes: "Rough-in wiring before drywall.",
      costLineId: undefined,
    },
    {
      id: "t-10",
      stage: "HVAC",
      task: "Rough-in / install HVAC — heat and cool supply runs for the addition",
      owner: "Otto (CSA F280 screen)",
      status: "not_started",
      targetDate: "",
      materialsRef: "TBD",
      notes:
        "Awaiting FILES COMPLETE — BEGIN REVIEW. Otto to provide rough capacity and duct sizing.",
      costLineId: "hvac",
    },
    {
      id: "t-11",
      stage: "Drywall",
      task: "Install drywall, tape, mud, sand (new portion)",
      owner: "Ry",
      status: "not_started",
      targetDate: "",
      materialsRef: "~53 sheets + mud/tape/bead/screws",
      notes: "Materials only in cost doc. Labour owner-finish.",
      costLineId: "dry-board",
    },
    {
      id: "t-12",
      stage: "Drywall",
      task: "Prime and paint drywall (new portion + touch-ups)",
      owner: "Ry",
      status: "not_started",
      targetDate: "",
      materialsRef: "Paint / primer / supplies ~$300–$600",
      notes: "Existing main floor already primed.",
      costLineId: "paint",
    },
    {
      id: "t-13",
      stage: "Kitchen",
      task: "Build and install IKEA kitchen cabinets",
      owner: "Ry / Kenan",
      status: "not_started",
      targetDate: "",
      materialsRef: "IKEA boxes + hardware",
      notes: "Boxes + hardware list to be confirmed. Countertop separate.",
      costLineId: undefined,
    },
    {
      id: "t-14",
      stage: "Kitchen",
      task: "Install kitchen countertops",
      owner: "Ry",
      status: "not_started",
      targetDate: "",
      materialsRef: "Starter allowance $1,500–$3,000",
      notes: "Countertop material TBD.",
      costLineId: "kit-counter",
    },
    {
      id: "t-15",
      stage: "Flooring",
      task: "Install flooring throughout the main floor (whole home)",
      owner: "Ry",
      status: "not_started",
      targetDate: "",
      materialsRef: "~1,800 sq ft @ $2–$3/sq ft materials",
      notes:
        "Includes existing + new portion (~494 sq ft).",
      costLineId: "flr-main",
    },
    {
      id: "t-16",
      stage: "Bathrooms",
      task: "Install bathrooms (primary ensuite, Kenan, powder room)",
      owner: "Ry",
      status: "not_started",
      targetDate: "",
      materialsRef: "See bath fixture rows in cost doc",
      notes:
        "Fixtures + tile materials listed. After drywall and flooring.",
      costLineId: undefined,
    },
    {
      id: "t-17",
      stage: "Doors + trim",
      task: "Install interior doors and trim (new portion)",
      owner: "Ry",
      status: "not_started",
      targetDate: "",
      materialsRef:
        "8 interior door slabs + hardware + baseboard/casing",
      notes:
        "Doors per A1.04 schedule. Baseboard ~252 LF, casing ~15 openings.",
      costLineId: "dr-slabs",
    },
    {
      id: "t-18",
      stage: "Painting",
      task: "Final paint and touch-ups throughout the main floor / whole home",
      owner: "Ry",
      status: "not_started",
      targetDate: "",
      materialsRef: "TBD",
      notes: "",
      costLineId: undefined,
    },
    {
      id: "t-19",
      stage: "Lighting",
      task: "Install interior lighting fixtures",
      owner: "Ry",
      status: "not_started",
      targetDate: "",
      materialsRef: "TBD",
      notes: "",
      costLineId: undefined,
    },
    {
      id: "t-20",
      stage: "HVAC final",
      task: "Final HVAC hookups and commissioning",
      owner: "Otto",
      status: "not_started",
      targetDate: "",
      materialsRef: "TBD",
      notes: "",
      costLineId: undefined,
    },
    {
      id: "t-21",
      stage: "Plumbing final",
      task: "Final plumbing fixture hookups",
      owner: "Ry",
      status: "not_started",
      targetDate: "",
      materialsRef: "TBD",
      notes: "",
      costLineId: undefined,
    },
  ],
};

// ----------- helpers used by the UI -----------

export const fmtUSD = (n: number | null | undefined): string => {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
};

export const fmtUSDPrecise = (n: number | null | undefined): string => {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
};

export const computeTotals = (costs: CostLine[]) => {
  const isExcluded = (status: string) =>
    status === "Open" || status === "Leave blank per Ry";
  // Filled-rows subtotal (excludes Open/TBD rows from the PDF scope)
  const filledLow = costs.reduce(
    (s, r) =>
      typeof r.lowTotal === "number" && !isExcluded(r.status) ? s + r.lowTotal : s,
    0
  );
  const filledHigh = costs.reduce(
    (s, r) =>
      typeof r.highTotal === "number" && !isExcluded(r.status) ? s + r.highTotal : s,
    0
  );

  const actualTotal = costs.reduce(
    (s, r) => (typeof r.actualAmount === "number" ? s + r.actualAmount : s),
    0
  );

  const filledActual = costs.reduce(
    (s, r) =>
      typeof r.actualAmount === "number" && !isExcluded(r.status)
        ? s + r.actualAmount
        : s,
    0
  );

  const tbdCount = costs.filter((r) => isExcluded(r.status)).length;

  return { filledLow, filledHigh, actualTotal, filledActual, tbdCount };
};

export const STATUS_LABELS: Record<TodoStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  blocked: "Blocked",
  done: "Done",
};

export const STATUS_ORDER: TodoStatus[] = [
  "not_started",
  "in_progress",
  "blocked",
  "done",
];

export const STATUS_COLORS: Record<TodoStatus, { ring: string; dot: string; chip: string }> = {
  not_started: {
    ring: "ring-steel-400/40",
    dot: "bg-steel-400",
    chip: "bg-steel-700/60 text-steel-100 border-steel-500/40",
  },
  in_progress: {
    ring: "ring-amber-400/40",
    dot: "bg-amber-400",
    chip: "bg-amber-500/20 text-amber-300 border-amber-400/40",
  },
  blocked: {
    ring: "ring-rust-400/40",
    dot: "bg-rust-400",
    chip: "bg-rust-500/20 text-rust-400 border-rust-400/40",
  },
  done: {
    ring: "ring-moss-400/40",
    dot: "bg-moss-400",
    chip: "bg-moss-500/20 text-moss-400 border-moss-400/40",
  },
};
