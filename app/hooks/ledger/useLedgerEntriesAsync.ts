import { useAppServices } from "@/context";
import { useAsync } from "@/lib/hooks/useAsync";
import type { LedgerEntry } from "@/lib/ledger/types/LedgerEntry";

export function useLedgerEntriesAsync() {
  const { ledger } = useAppServices();

  return useAsync<LedgerEntry[]>(
    () => ledger.getEntries(),
    true
  );
}

export function useLedgerEntriesGroupedByDayAsync() {
  const { ledger } = useAppServices();

  return useAsync<Record<string, LedgerEntry[]>>(
    () => ledger.getEntriesGroupedByDay(),
    true
  );
}

export function useTotalKcalGroupedByDayAsync() {
  const { ledger } = useAppServices();
  
  return useAsync<Record<string, number>>(
    async () => ledger.getTotalKcalGroupedByDay(),
    true
  );  
}