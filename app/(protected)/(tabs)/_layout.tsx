import { Tabs, useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

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
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'HOME',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          title: 'QUIZ',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="help-circle" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            // Only navigate if we're on a nested screen
            if (isOnNestedQuizScreen) {
              e.preventDefault();
              router.replace('/(protected)/(tabs)/quiz');
            }
            // If already on main quiz screen, let default behavior happen (do nothing)
          },
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'HISTORY',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            // Only navigate if we're on a nested screen
            if (isOnNestedBookmarksScreen) {
              e.preventDefault();
              router.replace('/(protected)/(tabs)/bookmarks');
            }
            // If already on main history screen, let default behavior happen (do nothing)
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'PROFILE',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
