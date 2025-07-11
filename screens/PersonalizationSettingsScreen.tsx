import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Switch, 
  TouchableOpacity, 
  Alert,
  SafeAreaView 
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { usePersonalization } from '../contexts/PersonalizationContext';
import { useAuth } from '../contexts/AuthContext';

const PersonalizationSettingsScreen = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { 
    config, 
    updateConfig, 
    getUserStats, 
    resetPersonalization, 
    isPersonalizationEnabled, 
    setPersonalizationEnabled 
  } = usePersonalization();
  
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const stats = await getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPersonalization = () => {
    Alert.alert(
      'Reset Personalization',
      'This will clear all your reading preferences and start fresh. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            await resetPersonalization();
            await loadUserStats();
            Alert.alert('Success', 'Your personalization has been reset.');
          }
        }
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      padding: 20,
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 15,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 15,
      paddingHorizontal: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: 10,
      marginBottom: 10,
    },
    settingLabel: {
      fontSize: 16,
      color: theme.colors.text,
      flex: 1,
    },
    settingDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 5,
    },
    statsContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 10,
      padding: 20,
      marginBottom: 20,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    statLabel: {
      fontSize: 16,
      color: theme.colors.text,
    },
    statValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    categoryList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 10,
    },
    categoryChip: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 15,
      marginRight: 8,
      marginBottom: 8,
    },
    categoryText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600',
    },
    resetButton: {
      backgroundColor: theme.colors.error,
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 20,
    },
    resetButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    sliderContainer: {
      flex: 1,
      marginLeft: 20,
    },
    sliderValue: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: 'bold',
      minWidth: 40,
      textAlign: 'right',
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.colors.text }}>Loading preferences...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personalization Settings</Text>
          
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Enable Personalization</Text>
              <Text style={styles.settingDescription}>
                Customize your news feed based on your reading habits
              </Text>
            </View>
            <Switch
              value={isPersonalizationEnabled}
              onValueChange={setPersonalizationEnabled}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Diversity Factor</Text>
              <Text style={styles.settingDescription}>
                How much variety to include in your feed (0% = only preferences, 100% = maximum variety)
              </Text>
            </View>
            <Text style={styles.sliderValue}>
              {Math.round(config.diversityFactor * 100)}%
            </Text>
          </View>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Recency Boost</Text>
              <Text style={styles.settingDescription}>
                How much to prioritize recent news
              </Text>
            </View>
            <Text style={styles.sliderValue}>
              {Math.round(config.recencyBoost * 100)}%
            </Text>
          </View>
        </View>

        {userStats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Reading Statistics</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Articles Read</Text>
                <Text style={styles.statValue}>{userStats.totalArticlesRead}</Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Articles Saved</Text>
                <Text style={styles.statValue}>{userStats.totalArticlesSaved}</Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Articles Shared</Text>
                <Text style={styles.statValue}>{userStats.totalArticlesShared}</Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Avg. Reading Time</Text>
                <Text style={styles.statValue}>{userStats.averageReadingTime} min</Text>
              </View>

              {userStats.topCategories && userStats.topCategories.length > 0 && (
                <>
                  <Text style={[styles.statLabel, { marginTop: 15, marginBottom: 10 }]}>
                    Your Favorite Categories
                  </Text>
                  <View style={styles.categoryList}>
                    {userStats.topCategories.map((category: string, index: number) => (
                      <View key={index} style={styles.categoryChip}>
                        <Text style={styles.categoryText}>{category}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced Settings</Text>
          
          <TouchableOpacity style={styles.resetButton} onPress={handleResetPersonalization}>
            <Text style={styles.resetButtonText}>Reset All Personalization</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PersonalizationSettingsScreen;