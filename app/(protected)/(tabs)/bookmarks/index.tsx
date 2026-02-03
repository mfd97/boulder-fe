import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

export default function BookmarksScreen() {
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
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Bookmarks</Text>
        </View>

        {/* Bookmark Cards */}
        <View style={styles.bookmarksList}>
          {/* First Bookmark Card */}
          <View style={styles.bookmarkCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.savedText}>SAVED 2 DAYS AGO</Text>
              <Ionicons name="bookmark" size={20} color={colors.offWhite} />
            </View>
            <Text style={styles.questionText}>
              Explain the concept of &apos;Backpropagation&apos; in neural networks and how it utilizes the chain rule.
            </Text>
            <TouchableOpacity style={styles.revealButton}>
              <Text style={styles.revealButtonText}>REVEAL ANSWER</Text>
              <Ionicons name="eye-outline" size={18} color={colors.offWhite} />
            </TouchableOpacity>
          </View>

          {/* Second Bookmark Card */}
          <View style={styles.bookmarkCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.savedText}>SAVED 5 DAYS AGO</Text>
              <Ionicons name="bookmark" size={20} color={colors.offWhite} />
            </View>
            <Text style={styles.questionText}>
              What is the difference between L1 and L2 regularization in terms of their effect on weight vectors?
            </Text>
            <TouchableOpacity style={styles.revealButton}>
              <Text style={styles.revealButtonText}>REVEAL ANSWER</Text>
              <Ionicons name="eye-outline" size={18} color={colors.offWhite} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.startReviewButton}>
          <Text style={styles.startReviewButtonText}>START REVIEW SESSION</Text>
        </TouchableOpacity>
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
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.offWhite,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100, // Space for bottom button
  },
  bookmarksList: {
    gap: 16,
  },
  bookmarkCard: {
    backgroundColor: colors.darkGrey,
    borderRadius: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  savedText: {
    fontSize: 11,
    color: colors.offWhite,
    opacity: 0.6,
    letterSpacing: 0.5,
  },
  questionText: {
    fontSize: 15,
    color: colors.offWhite,
    lineHeight: 22,
    marginBottom: 16,
  },
  revealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.charcoal,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  revealButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.offWhite,
    letterSpacing: 0.5,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
    backgroundColor: colors.charcoal,
    borderTopWidth: 1,
    borderTopColor: colors.darkGrey,
  },
  startReviewButton: {
    backgroundColor: colors.sage,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startReviewButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.charcoal,
    letterSpacing: 0.5,
  },
});
