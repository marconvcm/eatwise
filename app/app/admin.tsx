import LedgerEntryModal from '@/components/LedgerEntryModal';
import { Typography } from '@/components/Typography';
import { Theme } from '@/constants/theme';
import { useAppServices } from '@/context';
import { useCurrentUser } from '@/hooks/user/useCurrentUser';
import { useAsync } from '@/lib/hooks/useAsync';
import type { AdminDashboardReport } from '@/lib/ledger/types/AdminDashboardReport';
import type { LedgerEntry } from '@/lib/ledger/types/LedgerEntry';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function AdminPage() {
   const { data: currentUser } = useCurrentUser();
   const { adminReport, ledgerAdmin, ledgerEntryModal, openLedgerEntryModal, closeLedgerEntryModal } = useAppServices();
   const [activeTab, setActiveTab] = useState<'reports' | 'entries'>('reports');
   
   const { data: reportData, loading: loadingReport, execute: refetchReport } = useAsync<AdminDashboardReport>(
      () => adminReport.getAdminReport(),
      true
   );
   
   const { data: allEntries, loading: loadingEntries, execute: refetchEntries } = useAsync<LedgerEntry[]>(
      () => ledgerAdmin.getEntries(),
      false
   );

   // Load entries when switching to entries tab
   const handleTabChange = (tab: 'reports' | 'entries') => {
      setActiveTab(tab);
      if (tab === 'entries' && !allEntries) {
         refetchEntries();
      }
   };

   const handleRefresh = () => {
      if (activeTab === 'reports') {
         refetchReport();
      } else {
         refetchEntries();
      }
   };

   const handleDeleteEntry = async (entryId: string) => {
      Alert.alert(
         'Delete Entry',
         'Are you sure you want to delete this entry?',
         [
            {
               text: 'Cancel',
               style: 'cancel',
            },
            {
               text: 'Delete',
               style: 'destructive',
               onPress: async () => {
                  try {
                     await ledgerAdmin.deleteEntry(entryId);
                     refetchEntries();
                     refetchReport();
                  } catch (error) {
                     console.error('Failed to delete entry:', error);
                     Alert.alert('Error', 'Failed to delete entry');
                  }
               },
            },
         ]
      );
   };

   const renderRightActions = (entryId: string) => {
      return (
         <Pressable
            style={styles.deleteAction}
            onPress={() => handleDeleteEntry(entryId)}
         >
            <Typography variant="normal" style={styles.deleteActionText}>
               Delete
            </Typography>
         </Pressable>
      );
   };

   if (!currentUser?.isAdmin) {
      return (
         <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.centerContainer}>
               <Typography variant="header1">Access Denied</Typography>
               <Typography variant="normal" style={styles.subtitle}>
                  Admin role required
               </Typography>
            </View>
         </SafeAreaView>
      );
   }

   const isLoading = (activeTab === 'reports' && loadingReport) || (activeTab === 'entries' && loadingEntries);

   return (
      <GestureHandlerRootView style={{ flex: 1 }}>
         <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
               <Typography variant="header" style={styles.pageTitle}>
                  Admin
               </Typography>
            </View>

         <View style={styles.tabBar}>
            <Pressable
               style={[styles.tab, activeTab === 'reports' && styles.tabActive]}
               onPress={() => handleTabChange('reports')}
            >
               <Typography 
                  variant="normal" 
                  style={[styles.tabText, activeTab === 'reports' && styles.tabTextActive]}
               >
                  Reports
               </Typography>
            </Pressable>
            <Pressable
               style={[styles.tab, activeTab === 'entries' && styles.tabActive]}
               onPress={() => handleTabChange('entries')}
            >
               <Typography 
                  variant="normal" 
                  style={[styles.tabText, activeTab === 'entries' && styles.tabTextActive]}
               >
                  All Entries
               </Typography>
            </Pressable>
         </View>

         <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
               <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
            }
         >
            {activeTab === 'reports' && reportData && (
               <>
                  <View style={styles.section}>
                     <Typography variant="caption" style={styles.sectionHeader}>
                        WEEKLY COMPARISON
                     </Typography>
                     <View style={styles.card}>
                        <View style={styles.statRow}>
                           <View style={styles.statItem}>
                              <Typography variant="normal" style={styles.statLabel}>
                                 Last 7 Days
                              </Typography>
                              <Typography variant="header1" style={styles.statValue}>
                                 {reportData.weeklyComparison.currentWeekEntries}
                              </Typography>
                              <Typography variant="caption" style={styles.statSubtext}>
                                 entries
                              </Typography>
                           </View>
                           <View style={styles.statDivider} />
                           <View style={styles.statItem}>
                              <Typography variant="normal" style={styles.statLabel}>
                                 Previous 7 Days
                              </Typography>
                              <Typography variant="header1" style={styles.statValue}>
                                 {reportData.weeklyComparison.previousWeekEntries}
                              </Typography>
                              <Typography variant="caption" style={styles.statSubtext}>
                                 entries
                              </Typography>
                           </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.changeContainer}>
                           <Typography variant="normal" style={styles.changeLabel}>
                              Change
                           </Typography>
                           <Typography 
                              variant="normal" 
                              style={[
                                 styles.changeValue,
                                 reportData.weeklyComparison.percentageChange > 0 
                                    ? styles.changePositive 
                                    : reportData.weeklyComparison.percentageChange < 0 
                                    ? styles.changeNegative 
                                    : styles.changeNeutral
                              ]}
                           >
                              {reportData.weeklyComparison.percentageChange > 0 ? '+' : ''}
                              {reportData.weeklyComparison.percentageChange.toFixed(1)}%
                           </Typography>
                        </View>
                     </View>
                  </View>

                  <View style={styles.section}>
                     <Typography variant="caption" style={styles.sectionHeader}>
                        USER AVERAGES (LAST 7 DAYS)
                     </Typography>
                     <View style={styles.card}>
                        {reportData.userAverages.map((userAvg, index) => (
                           <View key={userAvg.userId}>
                              {index > 0 && <View style={styles.divider} />}
                              <View style={styles.row}>
                                 <Typography variant="normal" style={styles.rowLabel}>
                                    User {userAvg.userId.substring(0, 8)}...
                                 </Typography>
                                 <Typography variant="normal" style={styles.rowValue}>
                                    {userAvg.averageCalories.toFixed(0)} kcal/day
                                 </Typography>
                              </View>
                           </View>
                        ))}
                        {reportData.userAverages.length === 0 && (
                           <View style={styles.emptyState}>
                              <Typography variant="normal" style={styles.emptyText}>
                                 No data available
                              </Typography>
                           </View>
                        )}
                     </View>
                  </View>
               </>
            )}

            {activeTab === 'entries' && (
               <View style={styles.section}>
                  <Typography variant="caption" style={styles.sectionHeader}>
                     ALL FOOD ENTRIES
                  </Typography>
                  {loadingEntries && !allEntries && (
                     <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Theme.COLORS.primary.base} />
                     </View>
                  )}
                  {allEntries && (
                     <View style={styles.card}>
                        {allEntries.map((entry, index) => (
                           <View key={entry.id}>
                              {index > 0 && <View style={styles.divider} />}
                              <Swipeable
                                 renderRightActions={() => renderRightActions(entry.id)}
                                 overshootRight={false}
                              >
                                 <Pressable
                                    style={({ pressed }) => [
                                       styles.entryRow,
                                       pressed && styles.entryRowPressed
                                    ]}
                                    onPress={() => {
                                       const entryDate = entry.registrationDate.split('T')[0];
                                       openLedgerEntryModal(entryDate, entry);
                                    }}
                                 >
                                    <View style={styles.entryInfo}>
                                       <Typography variant="normal" style={styles.entrySubject}>
                                          {entry.subject}
                                       </Typography>
                                       <Typography variant="caption" style={styles.entryMeta}>
                                          {new Date(entry.registrationDate).toLocaleDateString()} • User {entry.userId.substring(0, 8)}
                                       </Typography>
                                    </View>
                                    <Typography variant="normal" style={styles.entryCalories}>
                                       {entry.calories} kcal
                                    </Typography>
                                 </Pressable>
                              </Swipeable>
                           </View>
                        ))}
                        {allEntries.length === 0 && (
                           <View style={styles.emptyState}>
                              <Typography variant="normal" style={styles.emptyText}>
                                 No entries found
                              </Typography>
                           </View>
                        )}
                     </View>
                  )}
               </View>
            )}         
            
            </ScrollView>

         <LedgerEntryModal
            visible={ledgerEntryModal.isOpen}
            currentDay={ledgerEntryModal.currentDay}
            currentEntry={ledgerEntryModal.currentEntry}
            onClose={closeLedgerEntryModal}
            onSuccess={handleRefresh}
            useAdminService={true}
         />
         </SafeAreaView>
      </GestureHandlerRootView>
      
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: '#f2f2f7',
   },
   header: {
      paddingHorizontal: Theme.SPACING_2F,
      paddingTop: Theme.SPACING_2F,
      paddingBottom: Theme.SPACING_HF / 2,
   },
   pageTitle: {
      marginBottom: 0,
   },
   centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: Theme.SPACING_2F,
   },
   subtitle: {
      color: Theme.COLORS.text.lighter,
   },
   tabBar: {
      flexDirection: 'row',
      backgroundColor: '#e5e5ea',
      marginHorizontal: Theme.SPACING_2F,
      marginBottom: Theme.SPACING_2F,
      borderRadius: 10,
      padding: 2,
   },
   tab: {
      flex: 1,
      paddingVertical: Theme.SPACING_HF / 2,
      alignItems: 'center',
      borderRadius: 8,
   },
   tabActive: {
      backgroundColor: '#ffffff',
   },
   tabText: {
      color: '#000000',
      opacity: 0.5,
   },
   tabTextActive: {
      opacity: 1,
      fontFamily: 'Manrope_600SemiBold',
   },
   scrollView: {
      flex: 1,
   },
   contentContainer: {
      paddingBottom: 120,
   },
   section: {
      marginBottom: Theme.SPACING_3F,
   },
   sectionHeader: {
      paddingHorizontal: Theme.SPACING_2F,
      marginBottom: Theme.SPACING_2F,
      color: '#6e6e73',
   },
   card: {
      backgroundColor: '#ffffff',
      marginHorizontal: Theme.SPACING_2F,
      borderRadius: 12,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
   },
   statRow: {
      flexDirection: 'row',
      paddingVertical: Theme.SPACING_3F,
   },
   statItem: {
      flex: 1,
      alignItems: 'center',
      gap: Theme.SPACING,
   },
   statLabel: {
      color: '#6e6e73',
      fontSize: 13,
   },
   statValue: {
      color: '#000000',
      fontSize: 36,
      letterSpacing: -1,
   },
   statSubtext: {
      color: '#6e6e73',
      fontSize: 12,
   },
   statDivider: {
      width: 0.5,
      backgroundColor: '#c6c6c8',
   },
   changeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: Theme.SPACING_2F,
      paddingHorizontal: Theme.SPACING_2F,
   },
   changeLabel: {
      color: '#000000',
   },
   changeValue: {
      fontFamily: 'Manrope_600SemiBold',
   },
   changePositive: {
      color: '#34c759',
   },
   changeNegative: {
      color: '#ff3b30',
   },
   changeNeutral: {
      color: '#6e6e73',
   },
   row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: Theme.SPACING_2F,
      paddingHorizontal: Theme.SPACING_2F,
      minHeight: 44,
   },
   rowLabel: {
      color: '#000000',
      flex: 1,
   },
   rowValue: {
      color: '#6e6e73',
      textAlign: 'right',
      marginLeft: Theme.SPACING_2F,
   },
   divider: {
      height: 0.5,
      backgroundColor: '#c6c6c8',
      marginLeft: Theme.SPACING_2F,
   },
   entryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: Theme.SPACING_2F,
      paddingHorizontal: Theme.SPACING_2F,
      minHeight: 60,
   },
   entryRowPressed: {
      backgroundColor: '#f2f2f7',
   },
   entryInfo: {
      flex: 1,
      gap: 4,
   },
   entrySubject: {
      color: '#000000',
      fontFamily: 'Manrope_600SemiBold',
   },
   entryMeta: {
      color: '#6e6e73',
      fontSize: 12,
   },
   entryCalories: {
      color: '#000000',
      fontFamily: 'Manrope_600SemiBold',
      marginLeft: Theme.SPACING_2F,
   },
   emptyState: {
      paddingVertical: Theme.SPACING_3F,
      alignItems: 'center',
   },
   emptyText: {
      color: '#6e6e73',
   },
   loadingContainer: {
      paddingVertical: Theme.SPACING_3F,
      alignItems: 'center',
   },
   deleteAction: {
      backgroundColor: '#ff3b30',
      justifyContent: 'center',
      alignItems: 'center',
      width: 80,
      height: '100%',
   },
   deleteActionText: {
      color: '#ffffff',
      fontFamily: 'Manrope_600SemiBold',
   },
});
