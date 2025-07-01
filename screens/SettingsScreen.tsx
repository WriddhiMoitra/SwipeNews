import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../contexts/ThemeContext';

export default function SettingsScreen({ onBack }: { onBack: () => void }) {
  const { theme, toggleTheme } = useTheme();
  // Fallback theme in case context is not available
  const fallbackTheme = {
    colors: {
      primary: '#E50914',
      text: '#1a1a1a',
      textSecondary: '#666666',
      background: '#ffffff',
      card: '#ffffff',
      border: '#e0e0e0',
      shadow: '#000000',
      surface: '#f5f5f5',
      surfaceVariant: '#f0f0f0',
      outline: '#cccccc',
      success: '#4CAF50',
      error: '#F44336',
    },
  };
  const activeTheme = theme || fallbackTheme;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={activeTheme.colors.text} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      <ScrollView style={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <TouchableOpacity
            style={[styles.settingItem, { borderColor: activeTheme.colors.border }]}
            onPress={toggleTheme}
          >
            <Icon name="moon" size={20} color={activeTheme.colors.textSecondary} style={styles.settingIcon} />
            <Text style={styles.settingText}>Toggle Dark/Light Mode</Text>
            <Icon name="chevron-right" size={20} color={activeTheme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={[styles.settingItem, { borderColor: activeTheme.colors.border }]}>
            <Icon name="user" size={20} color={activeTheme.colors.textSecondary} style={styles.settingIcon} />
            <Text style={styles.settingText}>Profile Settings</Text>
            <Icon name="chevron-right" size={20} color={activeTheme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingItem, { borderColor: activeTheme.colors.border }]}>
            <Icon name="lock" size={20} color={activeTheme.colors.textSecondary} style={styles.settingIcon} />
            <Text style={styles.settingText}>Change Password</Text>
            <Icon name="chevron-right" size={20} color={activeTheme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <TouchableOpacity style={[styles.settingItem, { borderColor: activeTheme.colors.border }]}>
            <Icon name="globe" size={20} color={activeTheme.colors.textSecondary} style={styles.settingIcon} />
            <Text style={styles.settingText}>News Sources</Text>
            <Icon name="chevron-right" size={20} color={activeTheme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingItem, { borderColor: activeTheme.colors.border }]}>
            <Icon name="filter" size={20} color={activeTheme.colors.textSecondary} style={styles.settingIcon} />
            <Text style={styles.settingText}>Content Filters</Text>
            <Icon name="chevron-right" size={20} color={activeTheme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <TouchableOpacity style={[styles.settingItem, { borderColor: activeTheme.colors.border }]}>
            <Icon name="info" size={20} color={activeTheme.colors.textSecondary} style={styles.settingIcon} />
            <Text style={styles.settingText}>About SwipeNews</Text>
            <Icon name="chevron-right" size={20} color={activeTheme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingItem, { borderColor: activeTheme.colors.border }]}>
            <Icon name="file-text" size={20} color={activeTheme.colors.textSecondary} style={styles.settingIcon} />
            <Text style={styles.settingText}>Terms of Service</Text>
            <Icon name="chevron-right" size={20} color={activeTheme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingItem, { borderColor: activeTheme.colors.border }]}>
            <Icon name="shield" size={20} color={activeTheme.colors.textSecondary} style={styles.settingIcon} />
            <Text style={styles.settingText}>Privacy Policy</Text>
            <Icon name="chevron-right" size={20} color={activeTheme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  settingIcon: {
    marginRight: 16,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
});
