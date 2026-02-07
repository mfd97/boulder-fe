import { Tabs, useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';

function triggerTabHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export default function TabsLayout() {
  const router = useRouter();
  const segments = useSegments();

  // Check if we're on a nested screen within a tab
  // segments looks like: ['(protected)', '(tabs)', 'quiz', 'CreateQuiz']
  // If there's a 4th segment, we're on a nested screen
  const isOnNestedQuizScreen = segments[2] === 'quiz' && segments.length > 3;
  const isOnNestedBookmarksScreen = segments[2] === 'bookmarks' && segments.length > 3;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.greenGlow,
        tabBarInactiveTintColor: colors.offWhite,
        tabBarStyle: {
          backgroundColor: colors.charcoal,
          borderTopWidth: 1,
          borderTopColor: 'rgba(240, 237, 232, 0.12)',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'HOME',
          tabBarAccessibilityLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
        listeners={{ tabPress: triggerTabHaptic }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          title: 'QUIZ',
          tabBarAccessibilityLabel: 'Quiz',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="help-circle" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            triggerTabHaptic();
            if (isOnNestedQuizScreen) {
              e.preventDefault();
              router.replace('/(protected)/(tabs)/quiz');
            }
          },
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'HISTORY',
          tabBarAccessibilityLabel: 'History',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            triggerTabHaptic();
            if (isOnNestedBookmarksScreen) {
              e.preventDefault();
              router.replace('/(protected)/(tabs)/bookmarks');
            }
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'PROFILE',
          tabBarAccessibilityLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
        listeners={{ tabPress: triggerTabHaptic }}
      />
    </Tabs>
  );
}
