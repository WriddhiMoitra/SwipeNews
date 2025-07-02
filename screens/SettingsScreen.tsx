import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../contexts/ThemeContext';
import { fallbackTheme } from '../constants/theme';

const styles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    color: theme.colors.text,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
  },
  settingIcon: {
    marginRight: 16,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
});

export default function SettingsScreen({ onBack }: { onBack: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const activeTheme = theme || fallbackTheme;
  const themedStyles = styles(activeTheme);

  return (
    <SafeAreaView style={themedStyles.container}>
      <View style={themedStyles.header}>
        <TouchableOpacity onPress={onBack} style={themedStyles.backButton}>
          <Icon name="arrow-left" size={24} color={activeTheme.colors.text} />
          <Text style={themedStyles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={themedStyles.headerTitle}>Settings</Text>
      </View>
      <ScrollView style={themedStyles.contentContainer}>
        <View style={themedStyles.section}>
          <Text style={themedStyles.sectionTitle}>Appearance</Text>
          <TouchableOpacity
            style={themedStyles.settingItem}
            onPress={toggleTheme}
          >
            <Icon name="moon" size={20} color={activeTheme.colors.textSecondary} style={themedStyles.settingIcon} />
            <Text style={themedStyles.settingText}>Toggle Dark/Light Mode</Text>
            <Icon name="chevron-right" size={20} color={activeTheme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={themedStyles.section}>
          <Text style={themedStyles.sectionTitle}>Account</Text>
          <TouchableOpacity style={themedStyles.settingItem}>
            <Icon name="user" size={20} color={activeTheme.colors.textSecondary} style={themedStyles.settingIcon} />
            <Text style={themedStyles.settingText}>Profile Settings</Text>
            <Icon name="chevron-right" size={20} color={activeTheme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={themedStyles.settingItem}>
            <Icon name="lock" size={20} color={activeTheme.colors.textSecondary} style={themedStyles.settingIcon} />
            <Text style={themedStyles.settingText}>Change Password</Text>
            <Icon name="chevron-right" size={20} color={activeTheme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={themedStyles.section}>
          <Text style={themedStyles.sectionTitle}>Preferences</Text>
          <TouchableOpacity style={themedStyles.settingItem}>
            <Icon name="globe" size={20} color={activeTheme.colors.textSecondary} style={themedStyles.settingIcon} />
            <Text style={themedStyles.settingText}>News Sources</Text>
            <Icon name="chevron-right" size={20} color={activeTheme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={themedStyles.settingItem}>
            <Icon name="filter" size={20} color={activeTheme.colors.textSecondary} style={themedStyles.settingIcon} />
            <Text style={themedStyles.settingText}>Content Filters</Text>
            <Icon name="chevron-right" size={20} color={activeTheme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={themedStyles.section}>
          <Text style={themedStyles.sectionTitle}>About</Text>
          <TouchableOpacity style={themedStyles.settingItem}>
            <Icon name="info" size={20} color={activeTheme.colors.textSecondary} style={themedStyles.settingIcon} />
            <Text style={themedStyles.settingText}>About SwipeNews</Text>
            <Icon name="chevron-right" size={20} color={activeTheme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={themedStyles.settingItem}>
            <Icon name="file-text" size={20} color={activeTheme.colors.textSecondary} style={themedStyles.settingIcon} />
            <Text style={themedStyles.settingText}>Terms of Service</Text>
            <Icon name="chevron-right" size={20} color={activeTheme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={themedStyles.settingItem}>
            <Icon name="shield" size={20} color={activeTheme.colors.textSecondary} style={themedStyles.settingIcon} />
            <Text style={themedStyles.settingText}>Privacy Policy</Text>
            <Icon name="chevron-right" size={20} color={activeTheme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
