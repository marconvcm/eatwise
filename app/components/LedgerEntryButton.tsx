import { Theme } from "@/constants/theme";
import type { LedgerEntry } from "@/lib/ledger/types/LedgerEntry";
import { inferEmojiFromSubject } from "@/lib/utils";
import { StyleSheet, Text, View } from "react-native";
import EntryButton from "./EntryButton";
import { Typography } from "./Typography";

type LedgerEntryButtonProps = {
  entry: LedgerEntry;
  onPress?: () => void;
};

export default function LedgerEntryButton({ entry, onPress }: LedgerEntryButtonProps) {
  const emoji = inferEmojiFromSubject(entry.subject);
  const time = new Date(entry.registrationDate).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return (
    <EntryButton onPress={onPress}>
      <View style={styles.container}>
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.contentContainer}>
          <Typography numberOfLines={1}>
            {entry.subject}
          </Typography>
          <Typography style={styles.calories}>
            {entry.calories}kcal
          </Typography>
        </View>
      </View>
      <Typography style={styles.time}>{time}</Typography>
    </EntryButton>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.SPACING_4F,
    gap: 4,
    alignItems: "flex-start",
    width: "100%",
  },
  emoji: {
    fontSize: 32,
    position: "absolute",
    top: Theme.SPACING_4F,
    right: Theme.SPACING_4F,
  },
  contentContainer: {
    flex: 1,
    gap: 2,
    justifyContent: "flex-end",
  },
  subject: {
    fontSize: 16,
    fontWeight: "400",
    color: Theme.COLORS.text.base,
    fontFamily: "Manrope_400Regular",
  },
  calories: {
    fontSize: 24,
    fontWeight: "700",
    color: Theme.COLORS.primary.base,
    fontFamily: "Manrope_700Bold",
  },
  time: {
    fontSize: 14,
    fontWeight: "400",
    color: Theme.COLORS.text.lighter,
    fontFamily: "Manrope_400Regular",
    position: "absolute",
    bottom: Theme.SPACING_4F,
    right: Theme.SPACING_4F,
  },
});
