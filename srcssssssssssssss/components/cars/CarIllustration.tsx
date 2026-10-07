import type { CarBodyType } from "@/types/car";

type Shape = {
  body: string;
  windows: [string, string];
  /** x position of the door seam between the two window panes */
  seam: number;
  front: [number, number];
  rear: [number, number];
};

/** Wheel centres are shared by every body so the shapes stay interchangeable. */
const WHEELS = [150, 490] as const;
const WHEEL_Y = 158;

const SHAPES: Record<CarBodyType, Shape> = {
  sedan: {
    body: "M30 158 L30 130 Q30 118 46 114 L122 106 Q154 60 214 50 L398 50 Q458 52 498 94 L574 104 Q608 110 612 134 L612 158 L524 158 A34 34 0 0 0 456 158 L184 158 A34 34 0 0 0 116 158 Z",
    windows: [
      "M158 100 Q182 66 224 60 L300 60 L300 100 Z",
      "M312 60 L394 60 Q438 64 470 100 L312 100 Z",
    ],
    seam: 306,
    front: [592, 118],
    rear: [30, 120],
  },
  suv: {
    body: "M28 158 L28 122 Q28 110 44 106 L94 100 L108 62 Q112 52 126 52 L438 52 Q456 52 466 64 L520 104 L582 110 Q614 116 614 138 L614 158 L524 158 A34 34 0 0 0 456 158 L184 158 A34 34 0 0 0 116 158 Z",
    windows: [
      "M122 98 L132 64 L300 64 L300 98 Z",
      "M312 64 L432 64 Q444 64 452 74 L488 98 L312 98 Z",
    ],
    seam: 306,
    front: [594, 120],
    rear: [28, 112],
  },
  hatch: {
    body: "M34 158 L34 120 Q34 100 58 86 Q84 56 142 52 L372 52 Q424 54 458 86 L476 102 L566 110 Q602 116 604 138 L604 158 L524 158 A34 34 0 0 0 456 158 L184 158 A34 34 0 0 0 116 158 Z",
    windows: [
      "M106 96 Q122 64 160 60 L300 60 L300 98 Z",
      "M312 60 L370 60 Q412 62 444 98 L312 98 Z",
    ],
    seam: 306,
    front: [584, 120],
    rear: [34, 110],
  },
  coupe: {
    body: "M30 158 L30 134 Q30 122 46 118 L130 110 Q176 72 244 62 L364 62 Q440 64 492 100 L582 108 Q614 114 616 140 L616 158 L524 158 A34 34 0 0 0 456 158 L184 158 A34 34 0 0 0 116 158 Z",
    windows: [
      "M170 104 Q196 76 250 70 L322 70 L322 104 Z",
      "M334 70 L362 70 Q424 72 462 104 L334 104 Z",
    ],
    seam: 328,
    front: [596, 122],
    rear: [30, 124],
  },
};

type Props = {
  type: CarBodyType;
  /** "line" is the gold outline used in the hero; "solid" is the painted card version. */
  mode?: "line" | "solid";
  paint?: string;
  className?: string;
  /** Hero only: stagger the one-time draw-in. */
  animate?: boolean;
};

export function CarIllustration({ type, mode = "solid", paint = "#E9EDF4", className, animate = false }: Props) {
  const shape = SHAPES[type];
  const isLine = mode === "line";

  const lineProps = (i: number) =>
    isLine
      ? {
          pathLength: 1,
          className: animate ? "draw-line" : undefined,
          style: animate ? { animationDelay: `${i * 0.18}s` } : undefined,
        }
      : {};

  return (
    <svg viewBox="0 14 640 190" role="img" aria-hidden="true" className={className} fill="none">
      {/* ground line */}
      <path
        d="M10 192 H630"
        stroke={isLine ? "#C9A24B" : "#FFFFFF"}
        strokeOpacity={isLine ? 0.45 : 0.14}
        strokeWidth={1.5}
        {...(isLine ? lineProps(0) : {})}
      />

      {/* Body parts are stretched vertically from the sill line so the cars read as cars, not limousines. */}
      <g transform="translate(0 158) scale(1 1.22) translate(0 -158)">
      {/* body */}
      <path
        d={shape.body}
        fill={isLine ? "none" : paint}
        stroke={isLine ? "#C9A24B" : "#0B1B33"}
        strokeOpacity={isLine ? 1 : 0.35}
        strokeWidth={isLine ? 2 : 1.5}
        strokeLinejoin="round"
        {...lineProps(1)}
      />

      {/* windows */}
      {shape.windows.map((d, i) => (
        <path
          key={i}
          d={d}
          fill={isLine ? "none" : "#0B1B33"}
          fillOpacity={isLine ? 0 : 0.88}
          stroke={isLine ? "#C9A24B" : "#0B1B33"}
          strokeWidth={isLine ? 1.6 : 1}
          strokeLinejoin="round"
          {...lineProps(2 + i)}
        />
      ))}

      {/* door seam */}
      <path
        d={`M${shape.seam} 62 V150`}
        stroke={isLine ? "#C9A24B" : "#0B1B33"}
        strokeOpacity={isLine ? 0.8 : 0.3}
        strokeWidth={1.4}
        {...lineProps(4)}
      />

      {/* lights */}
      <rect
        x={shape.front[0]}
        y={shape.front[1]}
        width={18}
        height={7}
        rx={3}
        fill={isLine ? "none" : "#F8E7B0"}
        stroke={isLine ? "#C9A24B" : "none"}
        strokeWidth={1.4}
        {...lineProps(5)}
      />
      <rect
        x={shape.rear[0]}
        y={shape.rear[1]}
        width={7}
        height={12}
        rx={2.5}
        fill={isLine ? "none" : "#B3261E"}
        stroke={isLine ? "#C9A24B" : "none"}
        strokeWidth={1.4}
        {...lineProps(5)}
      />
      </g>

      {/* wheels */}
      {WHEELS.map((cx, i) => (
        <g key={cx}>
          <circle
            cx={cx}
            cy={WHEEL_Y}
            r={32}
            fill={isLine ? "none" : "#0A1424"}
            stroke={isLine ? "#C9A24B" : "#0A1424"}
            strokeWidth={isLine ? 2 : 1}
            {...lineProps(6 + i)}
          />
          <circle
            cx={cx}
            cy={WHEEL_Y}
            r={14}
            fill={isLine ? "none" : "#B8C2D3"}
            stroke={isLine ? "#C9A24B" : "#7B889E"}
            strokeWidth={isLine ? 1.6 : 1}
            {...lineProps(7 + i)}
          />
        </g>
      ))}
    </svg>
  );
}
