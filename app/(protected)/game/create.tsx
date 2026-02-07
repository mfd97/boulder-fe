import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import { getFriends, Friend } from '@/api/friends';
import { useSocket } from '@/contexts/SocketContext';

const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
const ROUNDS = [1, 2, 3] as const;

// Animated pressable for buttons
function AnimatedButton({ 
  children, 
  onPress, 
  style,
  disabled = false,
}: { 
  children: React.ReactNode; 
  onPress?: () => void; 
  style?: any;
  disabled?: boolean;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.96, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
      disabled={disabled}
    >
      <Animated.View style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

export default function CreateGameScreen() {
  const router = useRouter();
  const { connect, isConnected, createGame, onError, offError } = useSocket();
  
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [rounds, setRounds] = useState<1 | 2 | 3>(1);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch friends list
  const { data: friends = [], isLoading: isLoadingFriends } = useQuery({
    queryKey: ['friends'],
    queryFn: getFriends,
  });

  // Connect to socket on mount
  useEffect(() => {
    if (!isConnected) {
      connect();
    }
  }, [connect, isConnected]);

  // Handle socket errors
  useEffect(() => {
    const handleError = (data: { message: string }) => {
      setIsCreating(false);
      Alert.alert('Error', data.message);
    };

    onError(handleError);
    return () => offError(handleError);
  }, [onError, offError]);

  const handleCreateGame = () => {
    if (!topic.trim()) {
      Alert.alert('Error', 'Please enter a topic');
      return;
    }

    if (!selectedFriend) {
      Alert.alert('Error', 'Please select a friend to challenge');
      return;
    }

    if (!isConnected) {
      Alert.alert('Error', 'Not connected to server. Please try again.');
      connect();
      return;
    }

    setIsCreating(true);

    createGame({
      topic: topic.trim(),
      difficulty,
      rounds,
      guestId: selectedFriend._id,
    });

    // Navigate to waiting room
    router.replace({
      pathname: '/(protected)/game/waiting',
      params: {
        topic: topic.trim(),
        difficulty,
        rounds: rounds.toString(),
        guestName: selectedFriend.fullName,
      },
    });
  };

  const canCreate = topic.trim().length > 0 && selectedFriend !== null && !isCreating;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.offWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Challenge a Friend</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Topic Input */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TOPIC</Text>
          <TextInput
            style={styles.topicInput}
            placeholder="e.g., World History, JavaScript, Space..."
            placeholderTextColor={colors.sage}
            value={topic}
            onChangeText={setTopic}
            returnKeyType="done"
          />
        </View>

        {/* Difficulty Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DIFFICULTY</Text>
          <View style={styles.optionsRow}>
            {DIFFICULTIES.map((d) => (
              <TouchableOpacity
                key={d}
                style={[
                  styles.optionButton,
                  difficulty === d && styles.optionButtonSelected,
                ]}
                onPress={() => setDifficulty(d)}
              >
                <Text style={[
                  styles.optionText,
                  difficulty === d && styles.optionTextSelected,
                ]}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rounds Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ROUNDS</Text>
          <Text style={styles.sectionSubtext}>Each round has 5 questions</Text>
          <View style={styles.optionsRow}>
            {ROUNDS.map((r) => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.roundButton,
                  rounds === r && styles.optionButtonSelected,
                ]}
                onPress={() => setRounds(r)}
              >
                <Text style={[
                  styles.roundNumber,
                  rounds === r && styles.optionTextSelected,
                ]}>
                  {r}
                </Text>
                <Text style={[
                  styles.roundLabel,
                  rounds === r && styles.optionTextSelected,
                ]}>
                  {r === 1 ? 'Round' : 'Rounds'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Friend Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CHALLENGE</Text>
          {isLoadingFriends ? (
            <ActivityIndicator color={colors.greenGlow} style={styles.loader} />
          ) : friends.length === 0 ? (
            <View style={styles.noFriendsContainer}>
              <Ionicons name="people-outline" size={40} color={colors.sage} />
              <Text style={styles.noFriendsText}>No friends yet</Text>
              <TouchableOpacity 
                style={styles.addFriendsButton}
                onPress={() => router.push('/(protected)/(tabs)/home/friends')}
              >
                <Text style={styles.addFriendsButtonText}>Add Friends</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.friendsList}>
              {friends.map((friend) => (
                <TouchableOpacity
                  key={friend._id}
                  style={[
                    styles.friendCard,
                    selectedFriend?._id === friend._id && styles.friendCardSelected,
                  ]}
                  onPress={() => setSelectedFriend(friend)}
                >
                  <View style={[
                    styles.friendAvatar,
                    selectedFriend?._id === friend._id && styles.friendAvatarSelected,
                  ]}>
                    <Text style={styles.friendInitial}>
                      {friend.fullName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{friend.fullName}</Text>
                    <Text style={styles.friendEmail}>{friend.email}</Text>
                  </View>
                  {selectedFriend?._id === friend._id && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.greenGlow} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Send Challenge Button */}
      <View style={styles.footer}>
        <AnimatedButton
          style={[
            styles.createButton,
            !canCreate && styles.createButtonDisabled,
          ]}
          onPress={handleCreateGame}
          disabled={!canCreate}
        >
          {isCreating ? (
            <ActivityIndicator color={colors.charcoal} />
          ) : (
            <>
              <Ionicons name="game-controller" size={20} color={colors.charcoal} />
              <Text style={styles.createButtonText}>Send Challenge</Text>
            </>
          )}
        </AnimatedButton>
      </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.offWhite,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.sage,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  sectionSubtext: {
    fontSize: 13,
    color: colors.sage,
    marginBottom: 12,
    marginTop: -8,
  },
  topicInput: {
    backgroundColor: colors.darkGrey,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.offWhite,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    backgroundColor: colors.darkGrey,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    borderColor: colors.greenGlow,
    backgroundColor: colors.greenGlow + '20',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.offWhite,
  },
  optionTextSelected: {
    color: colors.greenGlow,
  },
  roundButton: {
    flex: 1,
    backgroundColor: colors.darkGrey,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roundNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.offWhite,
  },
  roundLabel: {
    fontSize: 12,
    color: colors.sage,
    marginTop: 4,
  },
  loader: {
    marginTop: 20,
  },
  noFriendsContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: colors.darkGrey,
    borderRadius: 16,
  },
  noFriendsText: {
    fontSize: 16,
    color: colors.sage,
    marginTop: 12,
    marginBottom: 16,
  },
  addFriendsButton: {
    backgroundColor: colors.greenGlow,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addFriendsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.charcoal,
  },
  friendsList: {
    gap: 12,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkGrey,
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  friendCardSelected: {
    borderColor: colors.greenGlow,
    backgroundColor: colors.greenGlow + '15',
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.charcoal,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  friendAvatarSelected: {
    backgroundColor: colors.greenGlow + '30',
  },
  friendInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.offWhite,
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 34,
    backgroundColor: colors.charcoal,
    borderTopWidth: 1,
    borderTopColor: colors.darkGrey,
  },
  createButton: {
    backgroundColor: colors.greenGlow,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.charcoal,
  },
});
