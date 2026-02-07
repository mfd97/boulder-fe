import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import {
  sendFriendRequest,
  getPendingRequests,
  getSentRequests,
  getFriends,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  FriendRequest,
  Friend,
} from '@/api/friends';

export default function FriendsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'pending' | 'sent'>('friends');

  // Queries
  const { data: friends = [], isLoading: friendsLoading, refetch: refetchFriends } = useQuery({
    queryKey: ['friends'],
    queryFn: getFriends,
  });

  const { data: pendingRequests = [], isLoading: pendingLoading, refetch: refetchPending } = useQuery({
    queryKey: ['pendingRequests'],
    queryFn: getPendingRequests,
  });

  const { data: sentRequests = [], isLoading: sentLoading, refetch: refetchSent } = useQuery({
    queryKey: ['sentRequests'],
    queryFn: getSentRequests,
  });

  // Mutations
  const sendRequestMutation = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      Alert.alert('Success', 'Friend request sent!');
      setEmail('');
      queryClient.invalidateQueries({ queryKey: ['sentRequests'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || 'Failed to send friend request';
      Alert.alert('Error', message);
    },
  });

  const acceptMutation = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friendsLeaderboard'] });
    },
    onError: () => Alert.alert('Error', 'Failed to accept request'),
  });

  const declineMutation = useMutation({
    mutationFn: declineFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
    },
    onError: () => Alert.alert('Error', 'Failed to decline request'),
  });

  const removeMutation = useMutation({
    mutationFn: removeFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friendsLeaderboard'] });
    },
    onError: () => Alert.alert('Error', 'Failed to remove friend'),
  });

  const handleSendRequest = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }
    sendRequestMutation.mutate(email.trim().toLowerCase());
  };

  const handleRemoveFriend = (friend: Friend) => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${friend.fullName} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeMutation.mutate(friend.friendshipId),
        },
      ]
    );
  };

  const onRefresh = useCallback(() => {
    refetchFriends();
    refetchPending();
    refetchSent();
  }, [refetchFriends, refetchPending, refetchSent]);

  const isLoading = friendsLoading || pendingLoading || sentLoading;
  const isRefreshing = false;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.offWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Friends</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.greenGlow} />
        }
      >
        {/* Add Friend Section */}
        <View style={styles.addSection}>
          <Text style={styles.sectionTitle}>Add Friend</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.emailInput}
              placeholder="Enter email address"
              placeholderTextColor={colors.sage}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.sendButton, sendRequestMutation.isPending && styles.sendButtonDisabled]}
              onPress={handleSendRequest}
              disabled={sendRequestMutation.isPending}
            >
              {sendRequestMutation.isPending ? (
                <ActivityIndicator size="small" color={colors.charcoal} />
              ) : (
                <Ionicons name="paper-plane" size={20} color={colors.charcoal} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
            onPress={() => setActiveTab('friends')}
          >
            <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
              Friends ({friends.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
            onPress={() => setActiveTab('pending')}
          >
            <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
              Pending ({pendingRequests.length})
            </Text>
            {pendingRequests.length > 0 && <View style={styles.badge} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
            onPress={() => setActiveTab('sent')}
          >
            <Text style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>
              Sent ({sentRequests.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.greenGlow} />
          </View>
        ) : (
          <View style={styles.listContainer}>
            {/* Friends List */}
            {activeTab === 'friends' && (
              <>
                {friends.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="people-outline" size={48} color={colors.sage} />
                    <Text style={styles.emptyText}>No friends yet</Text>
                    <Text style={styles.emptySubtext}>Add friends using their email address</Text>
                  </View>
                ) : (
                  friends.map((friend) => (
                    <View key={friend._id} style={styles.friendCard}>
                      <View style={styles.avatarContainer}>
                        {friend.profilePicture ? (
                          <Image source={{ uri: friend.profilePicture }} style={styles.avatar} />
                        ) : (
                          <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                              {friend.fullName.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.friendInfo}>
                        <Text style={styles.friendName}>{friend.fullName}</Text>
                        <Text style={styles.friendEmail}>{friend.email}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveFriend(friend)}
                      >
                        <Ionicons name="close-circle" size={24} color={colors.sage} />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </>
            )}

            {/* Pending Requests */}
            {activeTab === 'pending' && (
              <>
                {pendingRequests.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="mail-outline" size={48} color={colors.sage} />
                    <Text style={styles.emptyText}>No pending requests</Text>
                    <Text style={styles.emptySubtext}>Friend requests you receive will appear here</Text>
                  </View>
                ) : (
                  pendingRequests.map((request) => (
                    <View key={request._id} style={styles.requestCard}>
                      <View style={styles.avatarContainer}>
                        {request.requester.profilePicture ? (
                          <Image
                            source={{ uri: request.requester.profilePicture }}
                            style={styles.avatar}
                          />
                        ) : (
                          <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                              {request.requester.fullName.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.friendInfo}>
                        <Text style={styles.friendName}>{request.requester.fullName}</Text>
                        <Text style={styles.friendEmail}>{request.requester.email}</Text>
                      </View>
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={styles.acceptButton}
                          onPress={() => acceptMutation.mutate(request._id)}
                          disabled={acceptMutation.isPending}
                        >
                          <Ionicons name="checkmark" size={20} color={colors.charcoal} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.declineButton}
                          onPress={() => declineMutation.mutate(request._id)}
                          disabled={declineMutation.isPending}
                        >
                          <Ionicons name="close" size={20} color={colors.offWhite} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </>
            )}

            {/* Sent Requests */}
            {activeTab === 'sent' && (
              <>
                {sentRequests.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="send-outline" size={48} color={colors.sage} />
                    <Text style={styles.emptyText}>No sent requests</Text>
                    <Text style={styles.emptySubtext}>Requests you send will appear here</Text>
                  </View>
                ) : (
                  sentRequests.map((request) => (
                    <View key={request._id} style={styles.friendCard}>
                      <View style={styles.avatarContainer}>
                        {request.recipient.profilePicture ? (
                          <Image
                            source={{ uri: request.recipient.profilePicture }}
                            style={styles.avatar}
                          />
                        ) : (
                          <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                              {request.recipient.fullName.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.friendInfo}>
                        <Text style={styles.friendName}>{request.recipient.fullName}</Text>
                        <Text style={styles.friendEmail}>{request.recipient.email}</Text>
                      </View>
                      <View style={styles.pendingBadge}>
                        <Text style={styles.pendingText}>Pending</Text>
                      </View>
                    </View>
                  ))
                )}
              </>
            )}
          </View>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.offWhite,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  addSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.offWhite,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  emailInput: {
    flex: 1,
    backgroundColor: colors.darkGrey,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.offWhite,
  },
  sendButton: {
    backgroundColor: colors.greenGlow,
    borderRadius: 12,
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.darkGrey,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
    backgroundColor: colors.greenGlow,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.sage,
  },
  activeTabText: {
    color: colors.charcoal,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.offWhite,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.sage,
    marginTop: 8,
    textAlign: 'center',
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkGrey,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkGrey,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.greenGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.charcoal,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.offWhite,
  },
  friendEmail: {
    fontSize: 13,
    color: colors.sage,
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: colors.greenGlow,
    borderRadius: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineButton: {
    backgroundColor: colors.darkGrey,
    borderRadius: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.sage,
  },
  pendingBadge: {
    backgroundColor: 'rgba(159, 242, 148, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pendingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.greenGlow,
  },
});
