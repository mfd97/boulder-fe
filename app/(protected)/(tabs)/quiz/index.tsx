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

export default function QuizScreen() {
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
          <Text style={styles.title}>Quiz Hub</Text>
          <Text style={styles.subtitle}>Deep knowledge made approachable.</Text>
        </View>

        {/* Create New Quiz Button */}
        <TouchableOpacity style={styles.createButton}>
          <View style={styles.createButtonContent}>
            <View style={styles.createButtonTextContainer}>
              <Text style={styles.createButtonTitle}>Create New Quiz</Text>
              <Text style={styles.createButtonSubtitle}>Generate with AI assistance</Text>
            </View>
            <Ionicons name="add-circle" size={32} color={colors.charcoal} />
          </View>
        </TouchableOpacity>

        {/* Recent Learning Section */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>RECENT LEARNING</Text>
            <TouchableOpacity>
              <Text style={styles.viewHistoryLink}>View History</Text>
            </TouchableOpacity>
          </View>

          {/* Quiz Items */}
          <View style={styles.quizItems}>
            {/* Neural Networks */}
            <TouchableOpacity style={styles.quizCard}>
              <View style={styles.quizCardContent}>
                <View style={styles.quizIconContainer}>
                  <Ionicons name="pulse" size={24} color={colors.greenGlow} />
                </View>
                <View style={styles.quizInfo}>
                  <Text style={styles.quizTitle}>Neural Networks</Text>
                  <Text style={styles.quizDetails}>85% SCORE • 2 days ago</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.offWhite} />
              </View>
            </TouchableOpacity>

            {/* Linear Algebra */}
            <TouchableOpacity style={styles.quizCard}>
              <View style={styles.quizCardContent}>
                <View style={styles.quizIconContainer}>
                  <Text style={styles.sigmaIcon}>Σ</Text>
                </View>
                <View style={styles.quizInfo}>
                  <Text style={styles.quizTitle}>Linear Algebra</Text>
                  <Text style={styles.quizDetails}>62% SCORE • Yesterday</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.offWhite} />
              </View>
            </TouchableOpacity>

            {/* SQL Optimization */}
            <TouchableOpacity style={styles.quizCard}>
              <View style={styles.quizCardContent}>
                <View style={styles.quizIconContainer}>
                  <Ionicons name="layers" size={24} color={colors.greenGlow} />
                </View>
                <View style={styles.quizInfo}>
                  <Text style={styles.quizTitle}>SQL Optimization</Text>
                  <Text style={styles.quizDetails}>NEW QUIZ • Ready</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.offWhite} />
              </View>
            </TouchableOpacity>
          </View>
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
  titleSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.offWhite,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.offWhite,
    opacity: 0.7,
  },
  createButton: {
    backgroundColor: '#3A3D40', // Light grey for button
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  createButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  createButtonTextContainer: {
    flex: 1,
  },
  createButtonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.offWhite,
    marginBottom: 4,
  },
  createButtonSubtitle: {
    fontSize: 12,
    color: colors.offWhite,
    opacity: 0.7,
  },
  recentSection: {
    marginBottom: 24,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.offWhite,
    letterSpacing: 1,
  },
  viewHistoryLink: {
    fontSize: 12,
    color: colors.offWhite,
    opacity: 0.7,
  },
  quizItems: {
    gap: 12,
  },
  quizCard: {
    backgroundColor: colors.darkGrey,
    borderRadius: 12,
    padding: 16,
  },
  quizCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quizIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.charcoal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sigmaIcon: {
    fontSize: 24,
    color: colors.greenGlow,
    fontWeight: 'bold',
  },
  quizInfo: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.offWhite,
    marginBottom: 4,
  },
  quizDetails: {
    fontSize: 12,
    color: colors.offWhite,
    opacity: 0.7,
  },
});
