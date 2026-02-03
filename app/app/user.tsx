import InviteFriendModal from '@/components/InviteFriendModal';
import { Typography } from '@/components/Typography';
import { Theme } from '@/constants/theme';
import { useCurrentUser } from '@/hooks/user/useCurrentUser';
import { setAuthToken } from '@/lib/http';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UserPage() {
   const { data: currentUser, loading } = useCurrentUser();
   const router = useRouter();
   const [inviteModalVisible, setInviteModalVisible] = useState(false);

   const handleLogout = async () => {
      Alert.alert(
         'Logout',
         'Are you sure you want to logout?',
         [
            {
               text: 'Cancel',
               style: 'cancel',
            },
            {
               text: 'Logout',
               style: 'destructive',
               onPress: async () => {
                  await setAuthToken(null);
                  router.replace('/');
               },
            },
         ]
      );
   };

   const today = new Date().toISOString().split('T')[0];

   if (loading) {
      return (
         <SafeAreaView style={styles.container}>
            <View style={styles.loadingContainer}>
               <Typography variant="normal">Loading...</Typography>
            </View>
         </SafeAreaView>
      );
   }

   if (!currentUser) {
      return (
         <SafeAreaView style={styles.container}>

            <View style={styles.centerContainer}>
               <Typography variant="header1">Not logged in</Typography>
               <Typography variant="normal" style={styles.subtitle}>
                  Please login to view your profile
               </Typography>
            </View>

         </SafeAreaView>
      );
   }

   return (
      <SafeAreaView style={styles.container} edges={['top']}>
         <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
            <Typography variant="header" style={styles.pageTitle}>
               Your Profile
            </Typography>

            <View style={styles.section}>
               <View style={styles.sectionCard}>
                  <View style={styles.row}>
                     <Typography variant="normal" style={styles.rowLabel}>Name</Typography>
                     <Typography variant="normal" style={styles.rowValue}>
                        {currentUser.name}
                     </Typography>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.row}>
                     <Typography variant="normal" style={styles.rowLabel}>Email</Typography>
                     <Typography variant="normal" style={styles.rowValue}>
                        {currentUser.email}
                     </Typography>
                  </View>
               </View>
            </View>

            <View style={styles.section}>
               <Typography variant="caption" style={styles.sectionHeader}>SETTINGS</Typography>
               <View style={styles.sectionCard}>
                  <View style={styles.row}>
                     <Typography variant="normal" style={styles.rowLabel}>Daily Calorie Goal</Typography>
                     <Typography variant="normal" style={styles.rowValue}>
                        {currentUser.kcalThreshold} kcal
                     </Typography>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.row}>
                     <Typography variant="normal" style={styles.rowLabel}>Role</Typography>
                     <Typography variant="normal" style={styles.rowValue}>
                        {currentUser.isAdmin ? 'Admin' : 'User'}
                     </Typography>
                  </View>
               </View>
            </View>

            <View style={styles.section}>
               <Pressable
                  style={({ pressed }) => [
                     styles.inviteButton,
                     pressed && styles.inviteButtonPressed
                  ]}
                  onPress={() => setInviteModalVisible(true)}
               >
                  <Typography variant="normal" style={styles.inviteButtonText}>
                     Invite a Friend
                  </Typography>
               </Pressable>
            </View>

            <View style={styles.section}>
               <Pressable
                  style={({ pressed }) => [
                     styles.logoutButton,
                     pressed && styles.logoutButtonPressed
                  ]}
                  onPress={handleLogout}
               >
                  <Typography variant="normal" style={styles.logoutButtonText}>
                     Logout
                  </Typography>
               </Pressable>
            </View>
         </ScrollView>

         <InviteFriendModal
            visible={inviteModalVisible}
            onClose={() => setInviteModalVisible(false)}
            onSuccess={() => {
               Alert.alert('Success', 'Your friend has been invited!');
            }}
         />
      </SafeAreaView>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: '#f2f2f7',
   },
   scrollView: {
      flex: 1,
   },
   contentContainer: {
      paddingBottom: 120,
   },
   loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
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
   pageTitle: {
      marginTop: Theme.SPACING_2F,
      marginBottom: Theme.SPACING_3F,
      paddingHorizontal: Theme.SPACING_2F,
   },
   section: {
      marginBottom: Theme.SPACING_3F,
   },
   sectionHeader: {
      paddingHorizontal: Theme.SPACING_2F,
      marginBottom: Theme.SPACING_HF / 2,
      color: '#6e6e73',
   },
   sectionCard: {
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
   inviteButton: {
      backgroundColor: Theme.COLORS.primary.base,
      marginHorizontal: Theme.SPACING_2F,
      paddingVertical: Theme.SPACING_2F,
      borderRadius: 12,
      alignItems: 'center',
      minHeight: 44,
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
   },
   inviteButtonPressed: {
      opacity: 0.7,
   },
   inviteButtonText: {
      color: '#ffffff',
      fontFamily: 'Manrope_600SemiBold',
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
   logoutButton: {
      backgroundColor: '#ffffff',
      marginHorizontal: Theme.SPACING_2F,
      paddingVertical: Theme.SPACING_2F,
      borderRadius: 12,
      alignItems: 'center',
      minHeight: 44,
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
   },
   logoutButtonPressed: {
      opacity: 0.7,
   },
   logoutButtonText: {
      color: Theme.COLORS.error.base,
      fontFamily: 'Manrope_600SemiBold',
   },
});
