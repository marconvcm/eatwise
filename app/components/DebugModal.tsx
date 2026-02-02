/**
 * Debug Modal Component
 * Allows switching between test users during development
 * DO NOT USE IN PRODUCTION
 */

import { DEBUG_USERS, type DebugUser } from '@/lib/debug/users';
import { setAuthToken } from '@/lib/http';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function DebugModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSelectUser = async (user: DebugUser) => {
    try {
      setLoading(true);
      await setAuthToken(user.accessToken);
      
      Alert.alert(
        'Token Set',
        `Logged in as ${user.name}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setOpen(false);
              setLoading(false);
              // Reset navigation to home
              router.replace('/');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', `Failed to set token: ${error}`);
      setLoading(false);
    }
  };

  const handleClearToken = async () => {
    try {
      setLoading(true);
      await setAuthToken(null);
      Alert.alert(
        'Token Cleared',
        'Logged out successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              setOpen(false);
              setLoading(false);
              // Reset navigation to home
              router.replace('/');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', `Failed to clear token: ${error}`);
      setLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.debugButton}
        onPress={() => setOpen(true)}
      >
        <Text style={styles.debugButtonText}>🐛</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>
                🐛 Debug Users
              </Text>
              <TouchableOpacity onPress={() => setOpen(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.subtitle}>
              Tap a user to set their access token and restart the app
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.buttonContainer}>
                {DEBUG_USERS.map((user, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSelectUser(user)}
                    disabled={loading}
                    style={[
                      styles.userButton,
                      user.isAdmin ? styles.adminButton : styles.regularButton,
                      loading && styles.disabledButton
                    ]}
                  >
                    <View style={styles.userInfo}>
                      <View style={styles.userRow}>
                        <Text style={styles.userName}>
                          {user.name}
                        </Text>
                        {user.isAdmin && (
                          <Text style={styles.adminBadge}>
                            ADMIN
                          </Text>
                        )}
                      </View>
                      <Text style={styles.userEmail}>
                        {user.email}
                      </Text>
                      <Text style={styles.tokenPreview} numberOfLines={1}>
                        Token: {user.accessToken.substring(0, 40)}...
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  onPress={handleClearToken}
                  disabled={loading}
                  style={[
                    styles.userButton,
                    styles.logoutButton,
                    loading && styles.disabledButton
                  ]}
                >
                  <Text style={styles.logoutText}>
                    🚪 Logout (Clear Token)
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <Text style={styles.warning}>
              ⚠️ Development Only - Do Not Use in Production
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  debugButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    opacity: 0.2,
  },
  debugButtonText: {
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  buttonContainer: {
    gap: 12,
    paddingBottom: 16,
  },
  userButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  adminButton: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  regularButton: {
    backgroundColor: '#f5f5f5',
    borderColor: '#d4d4d4',
  },
  logoutButton: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  userInfo: {
    gap: 4,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  adminBadge: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  tokenPreview: {
    fontSize: 12,
    color: '#999',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
    textAlign: 'center',
  },
  warning: {
    fontSize: 12,
    color: '#dc2626',
    textAlign: 'center',
    marginTop: 12,
  },
});
