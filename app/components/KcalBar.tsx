import { Theme } from "@/constants/theme";
import GaugeBar from "./GaugeBar";

type KcalBarProps = {
  min?: number;
  max: number;
  value: number;
  height?: number;
};

export default function KcalBar({
  min = 0,
  max,
  value,
  height = 8,
}: KcalBarProps) {
  const colorRanges = [
    { threshold: 0, color: Theme.COLORS.primary.base },
    { threshold: 60, color: "#eab308" }, // yellow-500
    { threshold: 80, color: "#f97316" }, // orange-500
    { threshold: 90, color: Theme.COLORS.error.lighter },
  ];

  return (
    <GaugeBar
      min={min}
      max={max}
      value={value}
      colorRanges={colorRanges}
      height={height}
      suffix="kcal"
    />
  );
}
