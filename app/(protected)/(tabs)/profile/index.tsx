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
import { colors } from '@/constants/colors';
import { logout, getMe, updateProfile } from '@/api/auth';
import { getProfileStats } from '@/api/quiz';
import * as SecureStore from 'expo-secure-store';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSocket } from '@/contexts/SocketContext';

export default function ProfileScreen() {
  const { setIsAuth } = useContext(AuthContext);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { disconnect } = useSocket();

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editProfilePicture, setEditProfilePicture] = useState<string | null>(null);

  // Fetch user data
  const { data: user, isLoading: userLoading, refetch: refetchUser } = useQuery({
    queryKey: ['user'],
    queryFn: getMe,
  });

  // Fetch profile stats
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['profileStats'],
    queryFn: getProfileStats,
    refetchOnMount: 'always',
    staleTime: 0,
  });

  // Update profile mutation
  const { mutate: saveProfile, isPending: isSaving } = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setIsEditModalOpen(false);
      Alert.alert('Success', 'Profile updated successfully');
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
    setEditName(user?.fullName || '');
    setEditProfilePicture(user?.profilePicture || null);
    setIsEditModalOpen(true);
  };

  const pickImage = async () => {
    // Request permission
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
    setEditProfilePicture(null);
  };

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
              refreshing={false}
              onRefresh={handleRefresh}
              tintColor={colors.greenGlow}
            />
          }
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <TouchableOpacity style={styles.avatarContainer} onPress={openEditModal} activeOpacity={0.7}>
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
            <TouchableOpacity onPress={openEditModal} activeOpacity={0.7}>
              <View style={styles.nameContainer}>
                <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
                <Ionicons name="pencil" size={14} color={colors.offWhite} style={styles.editIcon} />
              </View>
            </TouchableOpacity>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
          </View>

          {/* Statistics Section */}
          <View style={styles.statsSection}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats?.totalCompletions ?? 0}</Text>
              <Text style={styles.statLabel}>Completions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats?.averageMastery ?? 0}%</Text>
              <Text style={styles.statLabel}>Mastery</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats?.topicsStudied ?? 0}</Text>
              <Text style={styles.statLabel}>Topics Studied</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats?.currentStreak ?? 0}</Text>
              <Text style={styles.statLabel}>Daily Streak</Text>
              <Text style={styles.statSubtext}>{stats?.currentStreak === 1 ? 'Day' : 'Days'}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsSection}>
            <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
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
              <TouchableOpacity onPress={() => setIsEditModalOpen(false)}>
                <Ionicons name="close" size={24} color={colors.offWhite} />
              </TouchableOpacity>
            </View>

            {/* Profile Picture Editor */}
            <View style={styles.editAvatarSection}>
              <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
                {editProfilePicture ? (
                  <Image source={{ uri: editProfilePicture }} style={styles.editAvatarImage} />
                ) : (
                  <View style={styles.editAvatar}>
                    <Ionicons name="camera" size={32} color={colors.charcoal} />
                  </View>
                )}
              </TouchableOpacity>
              <View style={styles.avatarButtons}>
                <TouchableOpacity style={styles.changePhotoButton} onPress={pickImage}>
                  <Text style={styles.changePhotoText}>Change Photo</Text>
                </TouchableOpacity>
                {editProfilePicture && (
                  <TouchableOpacity style={styles.removePhotoButton} onPress={removeProfilePicture}>
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
                placeholderTextColor={colors.offWhite + '60'}
                autoCapitalize="words"
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSaveProfile}
              disabled={isSaving}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.sage,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.charcoal,
  },
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
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.offWhite,
  },
  editIcon: {
    opacity: 0.6,
  },
  userEmail: {
    fontSize: 14,
    color: colors.offWhite,
    opacity: 0.6,
    marginTop: 4,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.darkGrey,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.offWhite,
  },
  editAvatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  editAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.sage,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  changePhotoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.sage,
    borderRadius: 8,
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.charcoal,
  },
  removePhotoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.offWhite + '40',
  },
  removePhotoText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.offWhite,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.offWhite,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.charcoal,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.offWhite,
    borderWidth: 1,
    borderColor: colors.offWhite + '20',
  },
  saveButton: {
    backgroundColor: colors.greenGlow,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.charcoal,
    letterSpacing: 1,
  },
});
