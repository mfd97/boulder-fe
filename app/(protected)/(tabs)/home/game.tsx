import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, FadeInDown } from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import { getPendingInvitations, getGameHistory, GameInvitation, GameHistoryItem } from '@/api/game';
import { useSocket } from '@/contexts/SocketContext';
import EmptyState from '@/components/EmptyState';

// Animated pressable for buttons
function AnimatedButton({ 
  children, 
  onPress, 
  style,
}: { 
  children: React.ReactNode; 
  onPress?: () => void; 
  style?: any;
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
    >
      <Animated.View style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

export default function GameHubScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { 
    connect, 
    isConnected, 
    acceptGame, 
    declineGame,
    onInvitation,
    offInvitation,
    onGameStarted,
    offGameStarted,
  } = useSocket();

  // Fetch pending invitations
  const { data: invitations = [], isLoading: isLoadingInvitations, refetch: refetchInvitations } = useQuery({
    queryKey: ['gameInvitations'],
    queryFn: getPendingInvitations,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch game history
  const { data: history = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['gameHistory'],
    queryFn: getGameHistory,
  });

  // Connect to socket on mount
  useEffect(() => {
    if (!isConnected) {
      connect();
    }
  }, [connect, isConnected]);

  // Listen for new invitations and game started
  useEffect(() => {
    const handleInvitation = () => {
      refetchInvitations();
    };

    const handleGameStarted = (data: { gameId: string }) => {
      router.replace({
        pathname: '/(protected)/game/play',
        params: { gameId: data.gameId, isHost: 'false' },
      });
    };

    onInvitation(handleInvitation);
    onGameStarted(handleGameStarted);

    return () => {
      offInvitation(handleInvitation);
      offGameStarted(handleGameStarted);
    };
  }, [onInvitation, offInvitation, onGameStarted, offGameStarted, refetchInvitations, router]);

  const handleAcceptInvitation = (gameId: string) => {
    acceptGame(gameId);
    queryClient.invalidateQueries({ queryKey: ['gameInvitations'] });
  };

  const handleDeclineInvitation = (gameId: string, hostName: string) => {
    Alert.alert(
      'Decline Challenge',
      `Are you sure you want to decline ${hostName}'s challenge?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Decline',
          style: 'destructive',
          onPress: () => {
            declineGame(gameId);
            queryClient.invalidateQueries({ queryKey: ['gameInvitations'] });
          },
        },
      ]
    );
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'won': return '#4CAF50';
      case 'lost': return '#FF6B6B';
      default: return colors.sage;
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'won': return 'trophy';
      case 'lost': return 'close-circle';
      default: return 'remove-circle';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.offWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Multiplayer</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Challenge Button */}
        <AnimatedButton
          style={styles.challengeButton}
          onPress={() => router.push('/(protected)/game/create')}
        >
          <View style={styles.challengeIcon}>
            <Ionicons name="game-controller" size={28} color={colors.greenGlow} />
          </View>
          <View style={styles.challengeContent}>
            <Text style={styles.challengeTitle}>Challenge a Friend</Text>
            <Text style={styles.challengeSubtitle}>Start a new multiplayer game</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.sage} />
        </AnimatedButton>

        {/* Pending Invitations */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PENDING CHALLENGES</Text>
          {isLoadingInvitations ? (
            <ActivityIndicator color={colors.greenGlow} style={styles.loader} />
          ) : invitations.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="hourglass-outline" size={24} color={colors.sage} />
              <Text style={styles.emptyText}>No pending challenges</Text>
            </View>
          ) : (
            <View style={styles.invitationsList}>
              {invitations.map((invitation, index) => (
                <Animated.View 
                  key={invitation.gameId}
                  entering={FadeInDown.delay(index * 100)}
                  style={styles.invitationCard}
                >
                  <View style={styles.invitationHeader}>
                    <View style={styles.hostAvatar}>
                      <Text style={styles.hostInitial}>
                        {invitation.hostId.fullName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.invitationInfo}>
                      <Text style={styles.hostName}>{invitation.hostId.fullName}</Text>
                      <Text style={styles.invitationDetails}>
                        {invitation.topic} • {invitation.difficulty} • {invitation.rounds} {invitation.rounds === 1 ? 'round' : 'rounds'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.invitationActions}>
                    <TouchableOpacity
                      style={styles.declineButton}
                      onPress={() => handleDeclineInvitation(invitation.gameId, invitation.hostId.fullName)}
                    >
                      <Ionicons name="close" size={20} color="#FF6B6B" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => handleAcceptInvitation(invitation.gameId)}
                    >
                      <Ionicons name="checkmark" size={20} color={colors.charcoal} />
                      <Text style={styles.acceptText}>Accept</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              ))}
            </View>
          )}
        </View>

        {/* Game History */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>RECENT GAMES</Text>
          {isLoadingHistory ? (
            <ActivityIndicator color={colors.greenGlow} style={styles.loader} />
          ) : history.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="game-controller-outline" size={24} color={colors.sage} />
              <Text style={styles.emptyText}>No games played yet</Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {history.slice(0, 5).map((game, index) => (
                <Animated.View 
                  key={game.gameId}
                  entering={FadeInDown.delay(index * 100)}
                  style={styles.historyCard}
                >
                  <View style={styles.historyLeft}>
                    <View style={[styles.resultIcon, { backgroundColor: getResultColor(game.result) + '20' }]}>
                      <Ionicons 
                        name={getResultIcon(game.result) as any} 
                        size={20} 
                        color={getResultColor(game.result)} 
                      />
                    </View>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyTopic}>{game.topic}</Text>
                      <Text style={styles.historyOpponent}>vs {game.opponent.fullName}</Text>
                    </View>
                  </View>
                  <View style={styles.historyRight}>
                    <Text style={[styles.historyScore, { color: getResultColor(game.result) }]}>
                      {game.myScore} - {game.opponentScore}
                    </Text>
                    <Text style={[styles.historyResult, { color: getResultColor(game.result) }]}>
                      {game.result.toUpperCase()}
                    </Text>
                  </View>
                </Animated.View>
              ))}
            </View>
          )}
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
  },
  challengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkGrey,
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
    borderWidth: 2,
    borderColor: colors.greenGlow + '40',
  },
  challengeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.greenGlow + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  challengeContent: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.offWhite,
  },
  challengeSubtitle: {
    fontSize: 14,
    color: colors.sage,
    marginTop: 4,
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
  loader: {
    marginVertical: 20,
  },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.darkGrey,
    borderRadius: 12,
    padding: 20,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    color: colors.sage,
  },
  invitationsList: {
    gap: 12,
  },
  invitationCard: {
    backgroundColor: colors.darkGrey,
    borderRadius: 16,
    padding: 16,
  },
  invitationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  hostAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.greenGlow + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  hostInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.greenGlow,
  },
  invitationInfo: {
    flex: 1,
  },
  hostName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.offWhite,
  },
  invitationDetails: {
    fontSize: 13,
    color: colors.sage,
    marginTop: 2,
  },
  invitationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  declineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B20',
    borderRadius: 10,
    paddingVertical: 12,
  },
  acceptButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.greenGlow,
    borderRadius: 10,
    paddingVertical: 12,
  },
  acceptText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.charcoal,
  },
  historyList: {
    gap: 10,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.darkGrey,
    borderRadius: 12,
    padding: 14,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyTopic: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.offWhite,
  },
  historyOpponent: {
    fontSize: 13,
    color: colors.sage,
    marginTop: 2,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyScore: {
    fontSize: 16,
    fontWeight: '700',
  },
  historyResult: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
