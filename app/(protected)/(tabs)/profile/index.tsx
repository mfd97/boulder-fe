import React, { useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { logout } from '@/api/auth';
import * as SecureStore from 'expo-secure-store';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { setIsAuth } = useContext(AuthContext);
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } finally {
      await SecureStore.deleteItemAsync('token');
      setIsAuth(false);
      router.replace('/login');
    }
  }, [router, setIsAuth]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoText}>B</Text>
          </View>
          <Text style={styles.brandText}>BOULDER</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AS</Text>
            </View>
          </View>
          <Text style={styles.userName}>Alex Sterling</Text>
        </View>

        {/* Statistics Section */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>124</Text>
            <Text style={styles.statLabel}>Completions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>86%</Text>
            <Text style={styles.statLabel}>Mastery</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>Lv12</Text>
            <Text style={styles.statLabel}>Face Areas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Daily Streak</Text>
            <Text style={styles.statSubtext}>Days</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>EDIT PREFERENCES</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>LOG OUT</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.charcoal,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.greenGlow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.charcoal,
  },
  brandText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.offWhite,
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.sage,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.charcoal,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.offWhite,
  },
  statsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: colors.darkGrey,
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: '47%',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.greenGlow,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.offWhite,
    opacity: 0.8,
    textAlign: 'center',
  },
  statSubtext: {
    fontSize: 10,
    color: colors.offWhite,
    opacity: 0.6,
    marginTop: 2,
  },
  actionsSection: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: colors.darkGrey,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.sage,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.offWhite,
    letterSpacing: 1,
  },
  logoutButton: {
    backgroundColor: colors.darkGrey,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.offWhite,
    letterSpacing: 1,
  },
});
