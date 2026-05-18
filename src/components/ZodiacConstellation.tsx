import type { ZodiacSign } from "@/types";

type Star = [number, number, number?]; // x, y, brightness (0-1, default 1)
type Line = [number, number]; // index pairs

const CONSTELLATIONS: Record<ZodiacSign, { stars: Star[]; lines: Line[] }> = {
  Aries: {
    stars: [[18, 45], [35, 30], [55, 22], [72, 28]],
    lines: [[0, 1], [1, 2], [2, 3]],
  },
  Taurus: {
    stars: [[15, 55], [30, 42], [45, 30], [60, 22], [70, 35], [55, 45], [40, 55], [28, 60, 0.5]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6]],
  },
  Gemini: {
    stars: [[25, 18], [25, 35], [30, 50], [35, 65], [55, 18], [55, 35], [50, 50], [45, 65]],
    lines: [[0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7], [1, 5], [2, 6]],
  },
  Cancer: {
    stars: [[20, 55], [35, 40], [50, 30], [65, 40], [45, 55, 0.6], [55, 55, 0.6]],
    lines: [[0, 1], [1, 2], [2, 3], [2, 4], [4, 5]],
  },
  Leo: {
    stars: [[20, 30], [30, 18], [48, 20], [58, 30], [50, 42], [35, 45], [30, 58], [50, 65]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [5, 6], [6, 7]],
  },
  Virgo: {
    stars: [[20, 25], [35, 20], [50, 28], [60, 40], [48, 50], [35, 45], [25, 55], [55, 62], [70, 55]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [4, 7], [3, 8]],
  },
  Libra: {
    stars: [[25, 55], [40, 40], [60, 55], [40, 25], [25, 20, 0.6], [55, 20, 0.6]],
    lines: [[0, 1], [1, 2], [1, 3], [3, 4], [3, 5]],
  },
  Scorpio: {
    stars: [[10, 40], [22, 35], [35, 32], [48, 35], [58, 42], [65, 52], [72, 58], [78, 50]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]],
  },
  Sagittarius: {
    stars: [[25, 60], [35, 45], [50, 35], [65, 25], [40, 30], [55, 50], [70, 45]],
    lines: [[0, 1], [1, 2], [2, 3], [2, 4], [2, 5], [5, 6]],
  },
  Capricorn: {
    stars: [[20, 35], [35, 25], [55, 25], [68, 32], [65, 48], [50, 58], [35, 52]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 1]],
  },
  Aquarius: {
    stars: [[15, 35], [28, 28], [40, 35], [52, 28], [65, 35], [50, 50], [60, 60]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6]],
  },
  Pisces: {
    stars: [[18, 45], [28, 35], [40, 30], [55, 35], [65, 30], [75, 38], [55, 50], [40, 55]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [3, 6], [6, 7], [7, 2]],
  },
};

export function ZodiacConstellation({
  sign,
  size = 48,
  color = "#C8A96B",
}: {
  sign: ZodiacSign;
  size?: number;
  color?: string;
}) {
  const data = CONSTELLATIONS[sign];

  return (
    <svg width={size} height={size} viewBox="0 0 90 80" fill="none">
      {data.lines.map(([a, b], i) => (
        <line
          key={`l${i}`}
          x1={data.stars[a][0]}
          y1={data.stars[a][1]}
          x2={data.stars[b][0]}
          y2={data.stars[b][1]}
          stroke={color}
          strokeWidth="1"
          strokeOpacity="0.7"
        />
      ))}
      {data.stars.map(([x, y, brightness], i) => (
        <g key={`s${i}`}>
          <circle cx={x} cy={y} r="3.5" fill={color} fillOpacity={(brightness ?? 1) * 0.15} />
          <circle cx={x} cy={y} r="2" fill={color} fillOpacity={(brightness ?? 1) * 0.9} />
        </g>
      ))}
    </svg>
  );
}
