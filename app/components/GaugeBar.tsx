import { Theme } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

type ColorRange = {
  threshold: number; // Percentage (0-100)
  color: string;
};

type GaugeBarProps = {
  min: number;
  max: number;
  value: number;
  colorRanges?: ColorRange[];
  height?: number;
  backgroundColor?: string;
  borderRadius?: number;
  showLabels?: boolean;
  suffix?: string;
};

export default function GaugeBar({
  min,
  max,
  value,
  colorRanges = [
    { threshold: 0, color: Theme.COLORS.primary.base },
  ],
  height = 8,
  backgroundColor = Theme.COLORS.surface.dark,
  borderRadius = 4,
  showLabels = true,
  suffix = "",
}: GaugeBarProps) {
  // Calculate percentage
  const range = max - min;
  const normalizedValue = Math.max(min, Math.min(max, value)) - min;
  const percentage = range > 0 ? (normalizedValue / range) * 100 : 0;

  // Determine color based on percentage
  const getColor = () => {
    // Sort by threshold descending to find the highest threshold that matches
    const sortedRanges = [...colorRanges].sort((a, b) => b.threshold - a.threshold);
    
    for (const range of sortedRanges) {
      if (percentage >= range.threshold) {
        return range.color;
      }
    }
    
    // Fallback to first color if no match
    return colorRanges[0]?.color || Theme.COLORS.primary.base;
  };

  const fillColor = getColor();

  return (
    <View style={styles.wrapper}>
      {showLabels && (
        <View style={styles.labelsContainer}>
          <Text style={styles.label}>{min}</Text>
          <Text style={styles.label}>{max}</Text>
        </View>
      )}
      <View style={styles.barWrapper}>
        <View
          style={[
            styles.container,
            {
              height,
              backgroundColor,
              borderRadius,
            },
          ]}
        >
          <View
            style={[
              styles.fill,
              {
                width: `${percentage}%`,
                backgroundColor: fillColor,
                borderRadius,
              },
            ]}
          />
        </View>
        {showLabels && (
          <View
            style={[
              styles.valueLabel,
              {
                left: `${Math.min(percentage, 95)}%`,
                transform: [{ 
                  translateX: percentage > 95 ? "-70%" : percentage < 10 ? "0%" : "-50%"
               }],
              },
            ]}
          >
            <Text style={styles.valueText}>{Math.round(value)}{suffix}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    gap: 4,
  },
  labelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: Theme.COLORS.text.lighter,
    fontFamily: "Manrope_500Medium",
  },
  barWrapper: {
    position: "relative",
    width: "100%",
  },
  container: {
    width: "100%",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
  valueLabel: {
    position: "absolute",
    top: 12,
  },
  valueText: {
    fontSize: 14,
    fontWeight: "700",
    color: Theme.COLORS.text.base,
    fontFamily: "Manrope_700Bold",
    textAlign: "right",
  },
});
