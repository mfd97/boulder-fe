import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { LeaderboardEntry } from '@/api/friends';

interface LeaderboardProps {
  data: LeaderboardEntry[];
  isLoading: boolean;
  onAddFriends: () => void;
}

function LeaderboardRow({
  entry,
  index,
  styles,
  colors,
}: {
  entry: LeaderboardEntry;
  index: number;
  styles: ReturnType<typeof createLeaderboardStyles>;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  const isFirstPlace = entry.rank === 1;
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      style={[
        styles.leaderboardRow,
        entry.isCurrentUser && styles.currentUserRow,
        isFirstPlace && styles.firstPlaceRow,
      ]}
    >
      <View style={[styles.rankContainer, isFirstPlace && styles.firstPlaceRank]}>
        {isFirstPlace ? (
          <Ionicons name="trophy" size={14} color={colors.charcoal} />
        ) : (
          <Text style={[styles.rankText, isFirstPlace && styles.firstPlaceRankText]}>{entry.rank}</Text>
        )}
      </View>
      <View style={styles.rowAvatarContainer}>
        {entry.profilePicture ? (
          <Image source={{ uri: entry.profilePicture }} style={styles.rowAvatar} />
        ) : (
          <View style={styles.rowAvatarPlaceholder}>
            <Text style={styles.rowAvatarText}>{entry.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{entry.isCurrentUser ? 'You' : entry.name}</Text>
        <View style={styles.rowStats}>
          <View style={styles.statItem}>
            <Ionicons name="flame" size={12} color={colors.greenGlow} />
            <Text style={styles.statText}>{entry.currentStreak}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={12} color={colors.sage} />
            <Text style={styles.statText}>{entry.totalQuizzes}</Text>
          </View>
        </View>
      </View>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>{entry.totalScore}</Text>
        <Text style={styles.scoreLabel}>pts</Text>
      </View>
    </Animated.View>
  );
}

function createLeaderboardStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: { backgroundColor: colors.darkGrey, borderRadius: 20, padding: 16, marginTop: 8 },
    loadingContainer: {
      backgroundColor: colors.darkGrey,
      borderRadius: 20,
      padding: 40,
      alignItems: 'center',
      marginTop: 8,
    },
    emptyContainer: {
      backgroundColor: colors.darkGrey,
      borderRadius: 20,
      padding: 32,
      alignItems: 'center',
      marginTop: 8,
    },
    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.greenGlow + '26',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: colors.sage, textAlign: 'center', marginBottom: 20 },
    addFriendsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.greenGlow,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      gap: 8,
    },
    addFriendsText: { fontSize: 15, fontWeight: '600', color: colors.charcoal },
    listContainer: { gap: 8 },
    leaderboardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 12,
    },
    currentUserRow: { borderWidth: 1, borderColor: colors.greenGlow },
    firstPlaceRow: { backgroundColor: colors.greenGlow + '14' },
    rankContainer: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.greenGlow + '33',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    firstPlaceRank: { backgroundColor: colors.greenGlow },
    rankText: { fontSize: 13, fontWeight: '700', color: colors.greenGlow },
    firstPlaceRankText: { color: colors.charcoal },
    rowAvatarContainer: { marginRight: 12 },
    rowAvatar: { width: 40, height: 40, borderRadius: 20 },
    rowAvatarPlaceholder: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.sage,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowAvatarText: { fontSize: 16, fontWeight: '700', color: colors.charcoal },
    rowInfo: { flex: 1 },
    rowName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
    rowStats: { flexDirection: 'row', marginTop: 4, gap: 12 },
    statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    statText: { fontSize: 12, color: colors.sage },
    scoreContainer: { alignItems: 'flex-end' },
    scoreText: { fontSize: 18, fontWeight: '700', color: colors.greenGlow },
    scoreLabel: { fontSize: 10, color: colors.sage, marginTop: -2 },
    bottomAddButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      marginTop: 12,
      gap: 6,
    },
    bottomAddText: { fontSize: 14, fontWeight: '500', color: colors.greenGlow },
  });
}

export default function Leaderboard({ data, isLoading, onAddFriends }: LeaderboardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createLeaderboardStyles(colors), [colors]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.greenGlow} />
      </View>
    );
  }

  if (data.length <= 1) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="people" size={48} color={colors.greenGlow} />
        </View>
        <Text style={styles.emptyTitle}>Compete with Friends</Text>
        <Text style={styles.emptySubtitle}>Add friends to see who can climb the leaderboard</Text>
        <TouchableOpacity style={styles.addFriendsButton} onPress={onAddFriends}>
          <Ionicons name="person-add" size={18} color={colors.charcoal} />
          <Text style={styles.addFriendsText}>Add Friends</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        {data.map((entry, index) => (
          <LeaderboardRow key={entry.userId} entry={entry} index={index} styles={styles} colors={colors} />
        ))}
      </View>
      <TouchableOpacity style={styles.bottomAddButton} onPress={onAddFriends}>
        <Ionicons name="person-add-outline" size={16} color={colors.greenGlow} />
        <Text style={styles.bottomAddText}>Add More Friends</Text>
      </TouchableOpacity>
    </View>
  );
}
