import React, { useCallback, useContext, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { logout, getMe, updateProfile } from '@/api/auth';
import { useTheme } from '@/contexts/ThemeContext';
import { getProfileStats } from '@/api/quiz';
import * as SecureStore from 'expo-secure-store';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSocket } from '@/contexts/SocketContext';
import * as Haptics from 'expo-haptics';
import AppHeader from '@/components/AppHeader';
import Toast from '@/components/Toast';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import Card, { useCardStyle } from '@/components/Card';

export default function ProfileScreen() {
  const { setIsAuth } = useContext(AuthContext);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { disconnect } = useSocket();
  const { colors, colorScheme, setColorScheme } = useTheme();
  const cardStyle = useCardStyle();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        scrollView: { flex: 1 },
        scrollContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.section },
        titleSection: { marginBottom: spacing.xxl },
        title: { ...typography.title, color: colors.textPrimary, marginBottom: spacing.sm },
        subtitle: { ...typography.bodySmall, color: colors.sage, marginTop: spacing.xs },
        profileHeader: { alignItems: 'center', marginBottom: spacing.section },
        avatarContainer: { marginBottom: spacing.lg, position: 'relative' },
        avatar: {
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: colors.sage,
          justifyContent: 'center',
          alignItems: 'center',
        },
        avatarImage: { width: 100, height: 100, borderRadius: 50 },
        avatarText: { ...typography.display, fontSize: 36, color: colors.charcoal },
        editBadge: {
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: colors.greenGlow,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 2,
          borderColor: colors.charcoal,
        },
        nameContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
        userName: { ...typography.titleSmall, fontSize: 24, color: colors.textPrimary },
        editIcon: { opacity: 0.6 },
        userEmail: { ...typography.bodySmall, color: colors.textPrimary, opacity: 0.6, marginTop: spacing.xs },
        appearanceSection: { marginBottom: spacing.xxl },
        appearanceTitle: { ...typography.bodySmall, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.sm },
        appearanceRow: { flexDirection: 'row', gap: spacing.sm },
        themeOption: {
          flex: 1,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          borderRadius: 12,
          backgroundColor: colors.darkGrey,
          alignItems: 'center',
          borderWidth: 1.5,
          borderColor: 'transparent',
        },
        themeOptionActive: { borderColor: colors.greenGlow, backgroundColor: colors.greenGlow + '20' },
        themeOptionText: { ...typography.bodySmall, fontWeight: '600', color: colors.sage },
        themeOptionTextActive: { color: colors.greenGlow },
        statsSection: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xxxl },
        statCard: { ...cardStyle, flex: 1, minWidth: '47%', alignItems: 'center' },
        statNumber: { ...typography.title, fontSize: 28, color: colors.greenGlow, marginBottom: spacing.xs },
        statLabel: { ...typography.caption, color: colors.textPrimary, opacity: 0.8, textAlign: 'center' },
        statSubtext: { ...typography.label, color: colors.textPrimary, opacity: 0.6, marginTop: 2 },
        actionsSection: { gap: spacing.md },
        logoutButton: {
          backgroundColor: colors.darkGrey,
          borderRadius: 16,
          paddingVertical: spacing.lg,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.error + '40',
        },
        logoutButtonText: { ...typography.caption, fontWeight: '600', color: colors.error, letterSpacing: 1 },
        modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'flex-end' },
        modalContent: {
          backgroundColor: colors.darkGrey,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: spacing.xxl,
          paddingBottom: spacing.section,
        },
        modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xxl },
        modalTitle: { ...typography.titleSmall, color: colors.textPrimary },
        editAvatarSection: { alignItems: 'center', marginBottom: spacing.xxl },
        editAvatar: {
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: colors.sage,
          justifyContent: 'center',
          alignItems: 'center',
        },
        editAvatarImage: { width: 100, height: 100, borderRadius: 50 },
        avatarButtons: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
        changePhotoButton: {
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm,
          backgroundColor: colors.sage,
          borderRadius: spacing.sm,
        },
        changePhotoText: { ...typography.bodySmall, fontWeight: '600', color: colors.charcoal },
        removePhotoButton: {
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm,
          backgroundColor: 'transparent',
          borderRadius: spacing.sm,
          borderWidth: 1,
          borderColor: colors.textPrimary + '40',
        },
        removePhotoText: { ...typography.bodySmall, fontWeight: '600', color: colors.textPrimary },
        inputSection: { marginBottom: spacing.xxl },
        inputLabel: { ...typography.bodySmall, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.sm },
        textInput: {
          backgroundColor: colors.background,
          borderRadius: 12,
          padding: spacing.lg,
          ...typography.body,
          color: colors.textPrimary,
          borderWidth: 1,
          borderColor: colors.textPrimary + '20',
        },
        saveButton: {
          backgroundColor: colors.greenGlow,
          borderRadius: 16,
          paddingVertical: spacing.lg,
          alignItems: 'center',
        },
        saveButtonDisabled: { opacity: 0.6 },
        saveButtonText: { ...typography.caption, fontWeight: '600', color: colors.charcoal, letterSpacing: 1 },
      }),
    [colors, cardStyle]
  );

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editProfilePicture, setEditProfilePicture] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch user data
  const { data: user, isLoading: userLoading, refetch: refetchUser, isRefetching: isRefetchingUser } = useQuery({
    queryKey: ['user'],
    queryFn: getMe,
  });

  // Fetch profile stats
  const { data: stats, isLoading: statsLoading, refetch: refetchStats, isRefetching: isRefetchingStats } = useQuery({
    queryKey: ['profileStats'],
    queryFn: getProfileStats,
    refetchOnMount: 'always',
    staleTime: 0,
  });

  const isRefreshing = isRefetchingUser || isRefetchingStats;

  // Update profile mutation
  const { mutate: saveProfile, isPending: isSaving } = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setIsEditModalOpen(false);
      setToastMessage('Profile updated successfully');
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message || 'Failed to update profile');
    },
  });

  const isLoading = userLoading || statsLoading;

  // Generate initials from user's full name
  const initials = useMemo(() => {
    if (!user?.fullName) return '??';
    const names = user.fullName.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
  }, [user?.fullName]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } finally {
      // Disconnect socket
      disconnect();
      await SecureStore.deleteItemAsync('token');
      setIsAuth(false);
      router.replace('/login');
    }
  }, [router, setIsAuth, disconnect]);

  const confirmLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Log out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log out', style: 'destructive', onPress: handleLogout },
      ]
    );
  };

  const handleRefresh = () => {
    refetchUser();
    refetchStats();
  };

  const openEditModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditName(user?.fullName || '');
    setEditProfilePicture(user?.profilePicture || null);
    setIsEditModalOpen(true);
  };

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setEditProfilePicture(base64Image);
    }
  };

  const handleSaveProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    const updateData: { fullName?: string; profilePicture?: string } = {};

    if (editName.trim() !== user?.fullName) {
      updateData.fullName = editName.trim();
    }

    if (editProfilePicture !== user?.profilePicture) {
      updateData.profilePicture = editProfilePicture || '';
    }

    if (Object.keys(updateData).length === 0) {
      setIsEditModalOpen(false);
      return;
    }

    saveProfile(updateData);
  };

  const removeProfilePicture = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditProfilePicture(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <Toast
        message={toastMessage || ''}
        visible={!!toastMessage}
        onHide={() => setToastMessage(null)}
      />
      <AppHeader />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.greenGlow} />
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.greenGlow}
            />
          }
        >
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.subtitle}>Your account and stats</Text>
          </View>

          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={openEditModal}
              activeOpacity={0.7}
              accessibilityLabel="Edit profile photo"
              accessibilityRole="button"
            >
              {user?.profilePicture ? (
                <Image source={{ uri: user.profilePicture }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              )}
              <View style={styles.editBadge}>
                <Ionicons name="pencil" size={12} color={colors.charcoal} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={openEditModal}
              activeOpacity={0.7}
              accessibilityLabel="Edit display name"
              accessibilityRole="button"
            >
              <View style={styles.nameContainer}>
                <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
                <Ionicons name="pencil" size={14} color={colors.offWhite} style={styles.editIcon} />
              </View>
            </TouchableOpacity>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
          </View>

          {/* Statistics Section */}
          <View style={styles.statsSection}>
            <View style={styles.statCard} accessibilityLabel={`Completions: ${stats?.totalCompletions ?? 0}`} accessibilityRole="none">
              <Text style={styles.statNumber}>{stats?.totalCompletions ?? 0}</Text>
              <Text style={styles.statLabel}>Completions</Text>
            </View>
            <View style={styles.statCard} accessibilityLabel={`Mastery: ${stats?.averageMastery ?? 0}%`} accessibilityRole="none">
              <Text style={styles.statNumber}>{stats?.averageMastery ?? 0}%</Text>
              <Text style={styles.statLabel}>Mastery</Text>
            </View>
            <View style={styles.statCard} accessibilityLabel={`Topics studied: ${stats?.topicsStudied ?? 0}`} accessibilityRole="none">
              <Text style={styles.statNumber}>{stats?.topicsStudied ?? 0}</Text>
              <Text style={styles.statLabel}>Topics Studied</Text>
            </View>
            <View style={styles.statCard} accessibilityLabel={`Daily streak: ${stats?.currentStreak ?? 0} ${stats?.currentStreak === 1 ? 'day' : 'days'}`} accessibilityRole="none">
              <Text style={styles.statNumber}>{stats?.currentStreak ?? 0}</Text>
              <Text style={styles.statLabel}>Daily Streak</Text>
              <Text style={styles.statSubtext}>{stats?.currentStreak === 1 ? 'Day' : 'Days'}</Text>
            </View>
          </View>

          {/* Appearance */}
          <View style={styles.appearanceSection}>
            <Text style={styles.appearanceTitle}>Appearance</Text>
            <View style={styles.appearanceRow}>
              <TouchableOpacity
                style={[styles.themeOption, colorScheme === 'light' && styles.themeOptionActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setColorScheme('light');
                }}
                accessibilityLabel="Light mode"
                accessibilityRole="button"
              >
                <Text style={[styles.themeOptionText, colorScheme === 'light' && styles.themeOptionTextActive]}>Light</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.themeOption, colorScheme === 'dark' && styles.themeOptionActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setColorScheme('dark');
                }}
                accessibilityLabel="Dark mode"
                accessibilityRole="button"
              >
                <Text style={[styles.themeOptionText, colorScheme === 'dark' && styles.themeOptionTextActive]}>Dark</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.themeOption, colorScheme === 'system' && styles.themeOptionActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setColorScheme('system');
                }}
                accessibilityLabel="System default"
                accessibilityRole="button"
              >
                <Text style={[styles.themeOptionText, colorScheme === 'system' && styles.themeOptionTextActive]}>System</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={confirmLogout}
              accessibilityLabel="Log out"
              accessibilityRole="button"
            >
              <Text style={styles.logoutButtonText}>LOG OUT</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsEditModalOpen(false);
                }}
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Profile Picture Editor */}
            <View style={styles.editAvatarSection}>
              <TouchableOpacity onPress={pickImage} activeOpacity={0.7} accessibilityLabel="Change profile photo" accessibilityRole="button">
                {editProfilePicture ? (
                  <Image source={{ uri: editProfilePicture }} style={styles.editAvatarImage} />
                ) : (
                  <View style={styles.editAvatar}>
                    <Ionicons name="camera" size={32} color={colors.charcoal} />
                  </View>
                )}
              </TouchableOpacity>
              <View style={styles.avatarButtons}>
                <TouchableOpacity
                  style={styles.changePhotoButton}
                  onPress={pickImage}
                  accessibilityLabel="Change photo"
                  accessibilityRole="button"
                >
                  <Text style={styles.changePhotoText}>Change Photo</Text>
                </TouchableOpacity>
                {editProfilePicture && (
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={removeProfilePicture}
                    accessibilityLabel="Remove photo"
                    accessibilityRole="button"
                  >
                    <Text style={styles.removePhotoText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Name Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your name"
                placeholderTextColor={colors.textPrimary + '60'}
                autoCapitalize="words"
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSaveProfile}
              disabled={isSaving}
              accessibilityLabel="Save changes"
              accessibilityRole="button"
            >
              {isSaving ? (
                <ActivityIndicator color={colors.charcoal} />
              ) : (
                <Text style={styles.saveButtonText}>SAVE CHANGES</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
