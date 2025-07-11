import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../contexts/ThemeContext';
import { useEnhancedAnalytics, PrivacySettings } from '../contexts/EnhancedAnalyticsContext';
import { fallbackTheme } from '../constants/theme';

interface PrivacySettingsScreenProps {
  onBack: () => void;
}

export default function PrivacySettingsScreen({ onBack }: PrivacySettingsScreenProps) {
  const { theme } = useTheme();
  const activeTheme = theme || fallbackTheme;
  const styles = getStyles(activeTheme);
  
  const {
    privacySettings,
    updatePrivacySettings,
    exportUserData,
    deleteUserData,
    trackSettingsChange,
  } = useEnhancedAnalytics();

  const [settings, setSettings] = useState<PrivacySettings>(privacySettings);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setSettings(privacySettings);
  }, [privacySettings]);

  const handleSettingChange = async (key: keyof PrivacySettings, value: any) => {
    const oldValue = settings[key];
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      await updatePrivacySettings({ [key]: value });
      await trackSettingsChange(`privacy_${key}`, oldValue, value);
    } catch (error) {
      console.error('Error updating privacy setting:', error);
      // Revert on error
      setSettings(settings);
      Alert.alert('Error', 'Failed to update privacy setting. Please try again.');
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const userData = await exportUserData();
      if (userData) {
        Alert.alert(
          'Data Export',
          'Your data has been prepared for export. In a real app, this would be downloaded or emailed to you.',
          [{ text: 'OK' }]
        );
        console.log('Exported user data:', userData);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteData = async () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your data including preferences, reading history, and analytics. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteUserData();
              Alert.alert(
                'Data Deleted',
                'All your data has been permanently deleted.',
                [{ text: 'OK', onPress: onBack }]
              );
            } catch (error) {
              console.error('Error deleting data:', error);
              Alert.alert('Error', 'Failed to delete data. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const SettingRow = ({
    title,
    description,
    value,
    onValueChange,
    type = 'switch',
  }: {
    title: string;
    description: string;
    value: any;
    onValueChange: (value: any) => void;
    type?: 'switch' | 'number';
  }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: activeTheme.colors.border, true: activeTheme.colors.primary }}
          thumbColor={value ? activeTheme.colors.card : activeTheme.colors.textSecondary}
        />
      ) : (
        <TouchableOpacity
          style={styles.numberInput}
          onPress={() => {
            Alert.prompt(
              'Set Value',
              `Enter number of days (1-365):`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'OK',
                  onPress: (text) => {
                    const num = parseInt(text || '365', 10);
                    if (num >= 1 && num <= 365) {
                      onValueChange(num);
                    }
                  },
                },
              ],
              'plain-text',
              value.toString()
            );
          }}
        >
          <Text style={styles.numberInputText}>{value} days</Text>
          <Icon name="edit-2" size={16} color={activeTheme.colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={activeTheme.colors.text} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Data</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Collection</Text>
          <Text style={styles.sectionDescription}>
            Control what data SwipeNews collects to improve your experience.
          </Text>

          <SettingRow
            title="Enable Tracking"
            description="Allow SwipeNews to collect usage data for personalization and improvements"
            value={settings.trackingEnabled}
            onValueChange={(value) => handleSettingChange('trackingEnabled', value)}
          />

          <SettingRow
            title="Navigation Tracking"
            description="Track which screens you visit to improve app navigation"
            value={settings.trackNavigation}
            onValueChange={(value) => handleSettingChange('trackNavigation', value)}
          />

          <SettingRow
            title="Search Tracking"
            description="Track your search queries to improve search results"
            value={settings.trackSearch}
            onValueChange={(value) => handleSettingChange('trackSearch', value)}
          />

          <SettingRow
            title="Performance Tracking"
            description="Track app performance to identify and fix issues"
            value={settings.trackPerformance}
            onValueChange={(value) => handleSettingChange('trackPerformance', value)}
          />

          <SettingRow
            title="Error Tracking"
            description="Track app errors to improve stability"
            value={settings.trackErrors}
            onValueChange={(value) => handleSettingChange('trackErrors', value)}
          />

          <SettingRow
            title="Content Engagement"
            description="Track how you interact with articles for better recommendations"
            value={settings.trackContentEngagement}
            onValueChange={(value) => handleSettingChange('trackContentEngagement', value)}
          />

          <SettingRow
            title="Gamification Tracking"
            description="Track points, badges, and achievements"
            value={settings.trackGamification}
            onValueChange={(value) => handleSettingChange('trackGamification', value)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Privacy</Text>
          <Text style={styles.sectionDescription}>
            Control how your data is handled and stored.
          </Text>

          <SettingRow
            title="Anonymize Data"
            description="Remove personally identifiable information from collected data"
            value={settings.anonymizeData}
            onValueChange={(value) => handleSettingChange('anonymizeData', value)}
          />

          <SettingRow
            title="Data Retention Period"
            description="How long to keep your data before automatic deletion"
            value={settings.dataRetentionDays}
            onValueChange={(value) => handleSettingChange('dataRetentionDays', value)}
            type="number"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <Text style={styles.sectionDescription}>
            Export or delete your data at any time.
          </Text>

          <TouchableOpacity
            style={[styles.actionButton, styles.exportButton]}
            onPress={handleExportData}
            disabled={exporting}
          >
            <Icon name="download" size={20} color={activeTheme.colors.primary} />
            <Text style={[styles.actionButtonText, { color: activeTheme.colors.primary }]}>
              {exporting ? 'Exporting...' : 'Export My Data'}
            </Text>
            {exporting && <ActivityIndicator size="small" color={activeTheme.colors.primary} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteData}
            disabled={loading}
          >
            <Icon name="trash-2" size={20} color="#ff4444" />
            <Text style={[styles.actionButtonText, { color: '#ff4444' }]}>
              {loading ? 'Deleting...' : 'Delete All Data'}
            </Text>
            {loading && <ActivityIndicator size="small" color="#ff4444" />}
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Icon name="info" size={20} color={activeTheme.colors.textSecondary} />
          <Text style={styles.infoText}>
            Your privacy is important to us. We only collect data that helps improve your SwipeNews experience. 
            You can change these settings at any time, and all data collection respects your choices.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backText: {
      fontSize: 16,
      marginLeft: 8,
      fontWeight: '500',
      color: theme.colors.text,
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginRight: 60, // Compensate for back button
    },
    content: {
      flex: 1,
      padding: 16,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 8,
    },
    sectionDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 20,
      lineHeight: 20,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    settingInfo: {
      flex: 1,
      marginRight: 16,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    settingDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 18,
    },
    numberInput: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    numberInputText: {
      fontSize: 14,
      color: theme.colors.text,
      marginRight: 8,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
    },
    exportButton: {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.primary,
    },
    deleteButton: {
      backgroundColor: theme.colors.card,
      borderColor: '#ff4444',
    },
    actionButtonText: {
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
      marginRight: 8,
    },
    infoSection: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      marginTop: 20,
      marginBottom: 40,
    },
    infoText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginLeft: 12,
    },
  });