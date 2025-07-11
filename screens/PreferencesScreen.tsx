import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, FlatList, ScrollView, Dimensions, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useTheme } from '../contexts/ThemeContext';
import { RSS_FEEDS } from '../services/newsSourcesService';

const { width } = Dimensions.get('window');

export default function PreferencesScreen({ onPreferencesSet }: { onPreferencesSet: () => void }) {
  const { theme } = useTheme();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const regions = [
    { id: 'global', name: 'Global', icon: 'globe' },
    { id: 'india', name: 'India', icon: 'map-pin' },
    { id: 'delhi', name: 'Delhi', icon: 'map-pin' },
    { id: 'maharashtra', name: 'Maharashtra', icon: 'map-pin' },
    { id: 'karnataka', name: 'Karnataka', icon: 'map-pin' },
    { id: 'tamil-nadu', name: 'Tamil Nadu', icon: 'map-pin' },
    { id: 'west-bengal', name: 'West Bengal', icon: 'map-pin' },
    { id: 'kerala', name: 'Kerala', icon: 'map-pin' },
    { id: 'telangana', name: 'Telangana', icon: 'map-pin' },
  ];

  const languages = [
    { id: 'en', name: 'English', icon: 'type' },
    { id: 'hi', name: 'Hindi', icon: 'type' },
    { id: 'ml', name: 'Malayalam', icon: 'type' },
    { id: 'te', name: 'Telugu', icon: 'type' },
    { id: 'ta', name: 'Tamil', icon: 'type' },
  ];

  const categories = [
    { id: 'general', name: 'General News', icon: 'globe', color: '#4CAF50' },
    { id: 'politics', name: 'Politics', icon: 'users', color: '#2196F3' },
    { id: 'business', name: 'Business', icon: 'trending-up', color: '#FF9800' },
    { id: 'technology', name: 'Technology', icon: 'smartphone', color: '#9C27B0' },
    { id: 'sports', name: 'Sports', icon: 'activity', color: '#F44336' },
    { id: 'entertainment', name: 'Entertainment', icon: 'film', color: '#E91E63' },
    { id: 'health', name: 'Health', icon: 'heart', color: '#00BCD4' },
    { id: 'science', name: 'Science', icon: 'zap', color: '#607D8B' },
  ];

  // Get unique news sources from RSS_FEEDS
  const newsSources = RSS_FEEDS.map(feed => ({
    id: feed.id,
    name: feed.name,
    type: feed.country === 'global' ? 'International' : 
          feed.category === 'politics' ? 'Politics' :
          feed.language === 'hi' ? 'Hindi' :
          feed.language === 'ml' ? 'Malayalam' :
          feed.language === 'te' ? 'Telugu' :
          feed.language === 'ta' ? 'Tamil' :
          feed.region ? 'Regional' :
          feed.country === 'india' ? 'Indian' : 'Other'
  }));

  const steps = [
    { title: 'Choose Region', subtitle: 'Select your preferred region for news' },
    { title: 'Select Language', subtitle: 'Choose your preferred language' },
    { title: 'Pick Categories', subtitle: 'Select news categories you are interested in' },
    { title: 'Choose Sources', subtitle: 'Select your trusted news sources' },
  ];

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleSource = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const handleNext = () => {
    if (currentStep === 0 && !selectedRegion) {
      Alert.alert('Error', 'Please select a region.');
      return;
    }
    if (currentStep === 1 && !selectedLanguage) {
      Alert.alert('Error', 'Please select a language.');
      return;
    }
    if (currentStep === 2 && selectedCategories.length === 0) {
      Alert.alert('Error', 'Please select at least one category.');
      return;
    }
    if (currentStep === 3 && selectedSources.length === 0) {
      Alert.alert('Error', 'Please select at least one news source.');
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSavePreferences();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    const db = getFirestore();
    const auth = getAuth();
    const user = auth.currentUser;

    const preferences = {
      region: selectedRegion,
      language: selectedLanguage,
      categories: selectedCategories,
      sources: selectedSources,
      setAt: new Date().toISOString(),
    };

    if (user && !user.isAnonymous) {
      try {
        await setDoc(doc(db, 'userPreferences', user.uid), preferences);
        Alert.alert('Success', 'Preferences saved successfully!');
        onPreferencesSet();
      } catch (error: any) {
        console.error('Error saving preferences to Firestore:', error);
        // Fallback to local storage if Firestore write fails
        try {
          await AsyncStorage.setItem('userPreferences', JSON.stringify(preferences));
          Alert.alert('Success', 'Preferences saved locally due to Firestore error.');
          onPreferencesSet();
        } catch (localError: any) {
          Alert.alert('Error', localError.message || 'Failed to save preferences locally. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      // For anonymous users or if user is not authenticated, store preferences locally
      try {
        await AsyncStorage.setItem('userPreferences', JSON.stringify(preferences));
        Alert.alert('Success', 'Preferences saved locally!');
        onPreferencesSet();
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to save preferences locally. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderRegionItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.gridItem,
        selectedRegion === item.id ? styles.gridItemSelected : null,
      ]}
      onPress={() => setSelectedRegion(item.id)}
    >
      <Icon name={item.icon} size={24} color={selectedRegion === item.id ? '#fff' : theme.colors.primary} />
      <Text style={[
        styles.gridItemText,
        selectedRegion === item.id ? styles.gridItemTextSelected : null
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderLanguageItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.gridItem,
        selectedLanguage === item.id ? styles.gridItemSelected : null,
      ]}
      onPress={() => setSelectedLanguage(item.id)}
    >
      <Icon name={item.icon} size={24} color={selectedLanguage === item.id ? '#fff' : theme.colors.primary} />
      <Text style={[
        styles.gridItemText,
        selectedLanguage === item.id ? styles.gridItemTextSelected : null
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategories.includes(item.id) ? { ...styles.categoryItemSelected, backgroundColor: item.color } : null,
      ]}
      onPress={() => toggleCategory(item.id)}
    >
      <Icon 
        name={item.icon} 
        size={20} 
        color={selectedCategories.includes(item.id) ? '#fff' : item.color} 
      />
      <Text style={[
        styles.categoryText,
        selectedCategories.includes(item.id) ? styles.categoryTextSelected : { color: item.color }
      ]}>
        {item.name}
      </Text>
      {selectedCategories.includes(item.id) && (
        <Icon name="check" size={16} color="#fff" />
      )}
    </TouchableOpacity>
  );

  const renderSourceItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.sourceItem,
        selectedSources.includes(item.id) ? styles.sourceItemSelected : null,
      ]}
      onPress={() => toggleSource(item.id)}
    >
      <View style={styles.sourceInfo}>
        <Text style={styles.sourceName}>
          {item.name}
        </Text>
        <Text style={[
          styles.sourceType,
          selectedSources.includes(item.id) ? styles.sourceTypeSelected : null
        ]}>
          {item.type}
        </Text>
      </View>
      {selectedSources.includes(item.id) && (
        <Icon name="check" size={20} color={theme.colors.primary} />
      )}
    </TouchableOpacity>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <FlatList
            key="regions-grid"
            data={regions}
            renderItem={renderRegionItem}
            keyExtractor={item => item.id}
            numColumns={2}
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
          />
        );
      case 1:
        return (
          <FlatList
            key="languages-grid"
            data={languages}
            renderItem={renderLanguageItem}
            keyExtractor={item => item.id}
            numColumns={2}
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
          />
        );
      case 2:
        return (
          <FlatList
            key="categories-grid"
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.id}
            numColumns={2}
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
          />
        );
      case 3:
        return (
          <FlatList
            key="sources-list"
            data={newsSources}
            renderItem={renderSourceItem}
            keyExtractor={item => item.id}
            numColumns={1}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        );
      default:
        return null;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    progressContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 10,
    },
    progressDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.outline,
      marginHorizontal: 4,
    },
    progressDotActive: {
      backgroundColor: theme.colors.primary,
    },
    stepCounter: {
      textAlign: 'center',
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 30,
    },
    gridContainer: {
      flex: 1,
    },
    gridItem: {
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      padding: 20,
      margin: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
      elevation: 2,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    gridItemSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '10',
    },
    gridItemIcon: {
      marginBottom: 12,
    },
    gridItemText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
    },
    gridItemTextSelected: {
      color: theme.colors.primary,
    },
    categoryItem: {
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      padding: 16,
      margin: 6,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
      elevation: 2,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      minHeight: 100,
    },
    categoryItemSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '10',
    },
    categoryIcon: {
      marginBottom: 8,
    },
    categoryText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
    },
    categoryTextSelected: {
      color: theme.colors.primary,
    },
    sourcesList: {
      flex: 1,
    },
    sourceItem: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      marginVertical: 6,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sourceItemSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '10',
    },
    sourceInfo: {
      flex: 1,
    },
    sourceName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    sourceType: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    sourceTypeSelected: {
      backgroundColor: theme.colors.primary + '20',
      color: theme.colors.primary,
    },
    checkIcon: {
      marginLeft: 12,
    },
    footer: {
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    backButton: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 25,
      backgroundColor: theme.colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginLeft: 8,
    },
    nextButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 25,
      backgroundColor: theme.colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
    },
    nextButtonDisabled: {
      backgroundColor: theme.colors.outline,
    },
    nextButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#fff',
      marginRight: 8,
    },
    button: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 25,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonDisabled: {
      backgroundColor: theme.colors.outline,
    },
    fullWidthButton: {
      marginLeft: 0,
    },
    stepContent: {
      flex: 1,
    },
    listContainer: {
      paddingBottom: 20,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index <= currentStep ? styles.progressDotActive : null
              ]}
            />
          ))}
        </View>
        <Text style={styles.stepCounter}>{currentStep + 1} of {steps.length}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{steps[currentStep].title}</Text>
        <Text style={styles.subtitle}>{steps[currentStep].subtitle}</Text>
        
        <View style={styles.stepContent}>
          {renderStepContent()}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.buttonContainer}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={[styles.button, styles.backButton]}
              onPress={handleBack}
            >
              <Icon name="arrow-left" size={20} color={theme.colors.primary} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.button,
              styles.nextButton,
              isLoading && styles.buttonDisabled,
              currentStep === 0 ? styles.fullWidthButton : null
            ]}
            onPress={handleNext}
            disabled={isLoading}
          >
            <Text style={styles.nextButtonText}>
              {isLoading ? 'Saving...' : currentStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Text>
            {!isLoading && (
              <Icon 
                name={currentStep === steps.length - 1 ? 'check' : 'arrow-right'} 
                size={20} 
                color="#fff" 
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}