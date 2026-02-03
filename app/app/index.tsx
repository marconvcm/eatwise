import EntryButton from '@/components/EntryButton';
import KcalBar from '@/components/KcalBar';
import LedgerEntryButton from '@/components/LedgerEntryButton';
import LedgerEntryModal from '@/components/LedgerEntryModal';
import { PageContainer } from '@/components/PageContainer';
import PageIndicator from '@/components/PageIndicator';
import { Theme } from '@/constants/theme';
import { useAppServices } from '@/context';
import { useLedgerEntriesGroupedByDayAsync, useTotalKcalGroupedByDayAsync } from '@/hooks/ledger/useLedgerEntriesAsync';
import { useCurrentUser } from '@/hooks/user/useCurrentUser';
import type { LedgerEntry } from '@/lib/ledger/types/LedgerEntry';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatGrid } from 'react-native-super-grid';

const ENTRY_BUTTON_ID = 'entry-button';

export default function Index() {
   const { ledger, ledgerEntryModal, openLedgerEntryModal, closeLedgerEntryModal } = useAppServices();
   const { data: entriesByDay, loading, error, execute: refetchEntries } = useLedgerEntriesGroupedByDayAsync();
   const { data: totalByDay, loading: totalByDayLoaded, execute: refetchTotalByDay } = useTotalKcalGroupedByDayAsync()
   const { data: userProfile, loading: currentUserLoaded } = useCurrentUser()
   const [currentPage, setCurrentPage] = useState(0);
   const [isOnEditMode, setIsOnEditMode] = useState(false);
   const [entriesToErase, setEntriesToErase] = useState<Set<string>>(new Set());
   const pagerRef = useRef<PagerView>(null);

   const days = useMemo(() => {
      if (!entriesByDay) return [];
      return Object.keys(entriesByDay).sort((a, b) => a.localeCompare(b));
   }, [entriesByDay]);

   useEffect(() => {
      // Navigate to the last page (today/most recent) after data loads
      if (days.length > 0 && pagerRef.current) {
         const lastPageIndex = currentPage > 0 ? currentPage : days.length - 1;
         setCurrentPage(lastPageIndex);
         setTimeout(() => {
            pagerRef.current?.setPageWithoutAnimation(lastPageIndex);
         });
      }
   }, [days.length]);

   useEffect(() => {
      // When edit mode is turned off, delete all entries marked for deletion
      if (!isOnEditMode && entriesToErase.size > 0) {
         const deleteEntries = async () => {
            try {
               // Delete all entries in parallel
               await Promise.all(
                  Array.from(entriesToErase).map(entryId => 
                     ledger.deleteEntry(entryId)
                  )
               );
               
               // Clear the deletion list
               setEntriesToErase(new Set());
               
               // Reload entries
               await refetchEntries();
               await refetchTotalByDay();
            } catch (error) {
               console.error('Failed to delete entries:', error);
            }
         };
         
         deleteEntries();
      }
   }, [isOnEditMode]);

   const handleModalSuccess = async () => {
      await refetchEntries();
      await refetchTotalByDay();
   };

   if (loading) {
      return (
         <SafeAreaView style={styles.centerContent}>
            <Text>Loading...</Text>
         </SafeAreaView>
      );
   }

   if (error) {
      return (
         <SafeAreaView style={styles.centerContent}>
            <View style={styles.errorCard}>
               <Text>{error.message}</Text>
            </View>
         </SafeAreaView>
      );
   }

   function removeEntryFromDayCache(entriesByDay: Record<string, LedgerEntry[]> | null, day: string, id: string) {
      if (!entriesByDay) return;
      const updatedEntries = entriesByDay[day]?.filter(entry => entry.id !== id) || [];
      entriesByDay[day] = updatedEntries;
   }

   return (
      <>
         <SafeAreaView style={{ flex: 1 }}>
            <PageIndicator
               totalPages={days.length}
               currentPage={currentPage}
               color={Theme.COLORS.primary.base}
               disabledColor={Theme.COLORS.border.base}
               maxVisiblePages={5}
            />

            <PagerView
               ref={pagerRef}
               style={styles.pager}
               initialPage={days.length - 1}
               onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
            >
               {days.map((day) => (
                  <View key={day} style={styles.pageWrapper}>
                     <PageContainer date={day} actionButtons={[
                        { id: "edit", text: "EDIT", hidden: isOnEditMode, 
                           color: Theme.COLORS.border.base,
                           textColor: Theme.COLORS.text.dark},
                        { id: "done", text: entriesToErase.size > 0 ? `REMOVE` : "DONE", hidden: !isOnEditMode, 
                           color: entriesToErase.size > 0 ? Theme.COLORS.error.base : Theme.COLORS.primary.light, 
                           textColor: Theme.COLORS.surface.base},
                     ]} onActionPress={(id) => {
                        if (id === "edit") {
                           setIsOnEditMode(true);
                        }
                        if (id === "done") {
                           setIsOnEditMode(false);
                        }
                     }}>

                        <View style={{ padding: Theme.SPACING_2F }}>
                           <KcalBar
                              min={0}
                              max={userProfile?.kcalThreshold ?? 2000}
                              value={totalByDay?.[day] ?? 0} />
                        </View>

                        <FlatGrid
                           data={[ENTRY_BUTTON_ID, ...(entriesByDay?.[day] || [])]}
                           contentContainerStyle={{ paddingBottom: Theme.SPACING }}
                           renderItem={({ item }) => (
                              item === ENTRY_BUTTON_ID ? <EntryButton onPress={() => openLedgerEntryModal(day, null)} /> :
                                 <LedgerEntryButton 
                                 editMode={isOnEditMode}
                                 badgeText={entriesToErase.has((item as LedgerEntry).id) ? 'UNDO' : 'ERASE'}
                                 coma={entriesToErase.has((item as LedgerEntry).id)}
                                 onBadgePress={() => {
                                    if (!entriesToErase.has((item as LedgerEntry).id)) {
                                       const newSet = new Set(entriesToErase);
                                       newSet.add((item as LedgerEntry).id);
                                       setEntriesToErase(newSet);
                                    } else {
                                       const newSet = new Set(entriesToErase);
                                       newSet.delete((item as LedgerEntry).id);
                                       setEntriesToErase(newSet);
                                    }
                                 }}
                                 entry={item as LedgerEntry} onPress={() => openLedgerEntryModal(day, item as LedgerEntry)} />
                           )}
                           keyExtractor={(item) => (item as LedgerEntry)?.id || ENTRY_BUTTON_ID}
                           spacing={Theme.SPACING_2F}
                        />
                     </PageContainer>
                  </View>
               ))}
            </PagerView>

            <LedgerEntryModal
               visible={ledgerEntryModal.isOpen}
               currentDay={ledgerEntryModal.currentDay}
               currentEntry={ledgerEntryModal.currentEntry}
               onClose={closeLedgerEntryModal}
               onSuccess={handleModalSuccess}
            />
         </SafeAreaView>
      </>
   )
}

const styles = StyleSheet.create({
   pager: {
      flex: 1,
   },
   pageWrapper: {
      flex: 1,
   },
   centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
   },
   errorCard: {
      backgroundColor: '#fee2e2',
      padding: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#ef4444',
   },
});