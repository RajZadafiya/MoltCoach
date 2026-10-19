import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { authApi, extractErrorMessage } from '../../api';
import { Coach } from '../../interface';
import { ErrorView, LoadingView, SafeTouchable } from 'components';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ProfileScreen: React.FC = () => {
  const { coach: contextCoach, logout } = useAuth();
  const [coach, setCoach] = useState<Coach | null>(contextCoach);
  const [isLoading, setIsLoading] = useState(!contextCoach);
  const [error, setError] = useState<string | null>(null);

  const fetchCoachProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authApi.getMe();
      setCoach(data);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load profile.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!contextCoach) {
      fetchCoachProfile();
    }
  }, [contextCoach]);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {isLoading ? (
        <LoadingView message="Loading profile..." />
      ) : error ? (
        <ErrorView message={error} onRetry={fetchCoachProfile} />
      ) : (
        <View style={styles.content}>
          <View style={styles.avatarCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>
                {coach?.name?.charAt(0).toUpperCase() || 'C'}
              </Text>
            </View>
            <Text style={styles.coachName}>{coach?.name || 'Coach'}</Text>
            <Text style={styles.coachEmail}>{coach?.email}</Text>
          </View>

          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Gym / Studio</Text>
              <Text style={styles.detailValue}>
                {coach?.gymName || 'Molt Strength Studio'}
              </Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Active Clients</Text>
              <Text style={styles.detailValue}>{coach?.clientCount ?? 0}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Role</Text>
              <Text style={styles.detailValue}>{coach?.role || 'Coach'}</Text>
            </View>
          </View>

          <SafeTouchable
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </SafeTouchable>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  avatarCard: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarInitial: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  coachName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  coachEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  detailsSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  logoutButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#DC2626',
  },
});
