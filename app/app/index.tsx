import { DebugModal } from '@/components/DebugModal';
import EntryButton from '@/components/EntryButton';
import KcalBar from '@/components/KcalBar';
import LedgerEntryButton from '@/components/LedgerEntryButton';
import { PageContainer } from '@/components/PageContainer';
import PageIndicator from '@/components/PageIndicator';
import { Theme } from '@/constants/theme';
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
   const { data: entriesByDay, loading, error } = useLedgerEntriesGroupedByDayAsync();
   const { data: totalByDay, loading: totalByDayLoading } = useTotalKcalGroupedByDayAsync()
   const { data: userProfile, loading: currentUserLoaded } = useCurrentUser()
   const [currentPage, setCurrentPage] = useState(0);
   const pagerRef = useRef<PagerView>(null);

   const days = useMemo(() => {
      if (!entriesByDay) return [];
      return Object.keys(entriesByDay).sort((a, b) => a.localeCompare(b));
   }, [entriesByDay]);

   useEffect(() => {
      // Navigate to the last page (today/most recent) after data loads
      if (days.length > 0 && pagerRef.current) {
         const lastPageIndex = days.length - 1;
         setCurrentPage(lastPageIndex);
         setTimeout(() => {
            pagerRef.current?.setPage(lastPageIndex);
         }, 100);
      }
   }, [days.length]);

   if (loading) {
      return (
         <SafeAreaView style={styles.centerContent}>
            <Text>Loading...</Text>
            {__DEV__ && <DebugModal />}
         </SafeAreaView>
      );
   }

   if (error) {
      return (
         <SafeAreaView style={styles.centerContent}>
            <View style={styles.errorCard}>
               <Text>{error.message}</Text>
               {__DEV__ && <DebugModal />}
            </View>
         </SafeAreaView>
      );
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
                     <PageContainer date={day}>

                        <View style={{ padding: Theme.SPACING_2F }}>
                           <KcalBar
                              min={0} 
                              max={userProfile?.kcalThreshold ?? 2000} 
                              value={totalByDay?.[day] ?? 0} />
                        </View>

                        <FlatGrid
                           data={[ENTRY_BUTTON_ID, ...(entriesByDay?.[day] || [])]}
                           renderItem={({ item }) => (
                              item === ENTRY_BUTTON_ID ? <EntryButton /> :
                                 <LedgerEntryButton entry={item as LedgerEntry} onPress={() => { }} />
                           )}
                           keyExtractor={(item) => (item as LedgerEntry)?.id || ENTRY_BUTTON_ID}
                           spacing={Theme.SPACING_2F}
                        />
                     </PageContainer>
                  </View>
               ))}
            </PagerView>
         </SafeAreaView>
         {__DEV__ && <DebugModal />}
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