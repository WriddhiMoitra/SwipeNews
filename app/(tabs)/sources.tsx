import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, Animated, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useFeed } from '../../contexts/FeedContext';
import { useEnhancedAnalytics } from '../../contexts/EnhancedAnalyticsContext';
import { useNavigationTracking } from '../../hooks/useNavigationTracking';
import { NEWS_CATEGORIES, getCategoryById } from '../../services/newsSourcesService';
import NewsCard from '../../components/NewsCard';
import { fallbackTheme } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function CategoriesScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { state, refreshFeed, setCategory, toggleSaveArticle } = useFeed();
  const { trackNavigation, trackContentEngagement, trackPerformance } = useEnhancedAnalytics();
  
  // Add navigation tracking
  useNavigationTracking('CategoriesScreen', true);
  const activeTheme = theme || fallbackTheme;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [animations, setAnimations] = useState<{ [key: string]: Animated.Value }>({});

  useEffect(() => {
    // Initialize animations for each category
    const anims: { [key: string]: Animated.Value } = {};
    NEWS_CATEGORIES.forEach(category => {
      anims[category.id] = new Animated.Value(1);
    });
    setAnimations(anims);
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const validCategory = NEWS_CATEGORIES.find(cat => cat.id === selectedCategory);
      if (validCategory) {
        setCategory(selectedCategory);
        refreshFeed();
      } else {
        setSelectedCategory(null);
      }
    }
  }, [selectedCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshFeed();
    setRefreshing(false);
  };

  const handleCategoryPress = async (categoryId: string) => {
    const category = getCategoryById(categoryId);
    if (!category) return;

    // Track category selection
    await trackContentEngagement('interaction_timing', {
      action: 'category_selected',
      category: categoryId,
      previousCategory: selectedCategory,
      timeOfDay: new Date().getHours().toString(),
      dayOfWeek: new Date().getDay().toString(),
    });

    // Reset all animations
    Object.values(animations).forEach(anim => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });

    // Animate the selected category
    if (animations[categoryId]) {
      Animated.sequence([
        Animated.timing(animations[categoryId], {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animations[categoryId], {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animations[categoryId], {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setSelectedCategory(categoryId);
      });
    } else {
      setSelectedCategory(categoryId);
    }
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setCategory(null);
    refreshFeed();
  };

  const renderCategoryItem = ({ item }: { item: any }) => {
    const isSelected = selectedCategory === item.id;
    const category = getCategoryById(item.id);
    const anim = animations[item.id] || new Animated.Value(1);

    return (
      <Animated.View
        style={[
          styles.categoryItem,
          { transform: [{ scale: anim }] },
          isSelected && { borderColor: category?.color || '#E50914', borderWidth: 2 },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.categoryTile,
            { backgroundColor: category?.color || '#E50914' },
          ]}
          onPress={() => handleCategoryPress(item.id)}
          activeOpacity={0.8}
        >
          <Icon 
            name={category?.icon || 'globe'} 
            size={24} 
            color="#fff" 
          />
          <Text style={styles.categoryText}>{item.name}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderArticleItem = ({ item }: { item: any }) => {
    return (
      <NewsCard
        article={item}
        onSave={toggleSaveArticle}
        onShare={() => { /* Handle share */ }}
        onReadMore={() => { /* Handle read more */ }}
      />
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: activeTheme.colors.background,
    },
    header: {
      paddingTop: 50,
      paddingBottom: 20,
      paddingHorizontal: 20,
      backgroundColor: activeTheme.colors.card,
      borderBottomWidth: 1,
      borderBottomColor: activeTheme.colors.border,
    },
    headerText: {
      fontSize: 24,
      fontWeight: '700',
      color: activeTheme.colors.text,
      marginBottom: 4,
    },
    headerSubtext: {
      fontSize: 14,
      color: activeTheme.colors.textSecondary,
    },
    categoriesContainer: {
      padding: 16,
    },
    categoryItem: {
      width: (width - 48) / 2, // 2 columns with spacing
      marginBottom: 16,
      marginHorizontal: 8,
      borderRadius: 16,
      overflow: 'hidden',
    },
    categoryTile: {
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      height: 120,
    },
    categoryText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: 8,
      textAlign: 'center',
    },
    articlesList: {
      flex: 1,
      padding: 16,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      backgroundColor: activeTheme.colors.card,
      borderRadius: 8,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: activeTheme.colors.border,
    },
    backButtonText: {
      marginLeft: 8,
      fontSize: 16,
      color: activeTheme.colors.text,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      color: activeTheme.colors.textSecondary,
      marginTop: 16,
      marginBottom: 8,
    },
  });

  // Robust null check for user and NEWS_CATEGORIES
  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: activeTheme.colors.background }}>
        <Text style={{ color: activeTheme.colors.text, fontSize: 18, textAlign: 'center', margin: 24 }}>
          You must be logged in to view categories.
        </Text>
      </View>
    );
  }
  if (!Array.isArray(NEWS_CATEGORIES) || NEWS_CATEGORIES.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: activeTheme.colors.background }}>
        <Text style={{ color: activeTheme.colors.text, fontSize: 18, textAlign: 'center', margin: 24 }}>
          No categories available. Please try again later.
        </Text>
      </View>
    );
  }

  if (!selectedCategory) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Categories</Text>
          <Text style={styles.headerSubtext}>Select a category to view articles</Text>
        </View>
        <FlatList
          data={NEWS_CATEGORIES}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.categoriesContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#E50914']}
              tintColor="#E50914"
            />
          }
        />
      </View>
    );
  }

  // Defensive: filter out undefined/null articles and ensure correct type
  const sortedArticles = (state.articles || []).filter(a => a && a.published_at && a.id).sort((a, b) => {
    try {
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    } catch {
      return 0;
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{getCategoryById(selectedCategory)?.name || 'Category'} Articles</Text>
        <Text style={styles.headerSubtext}>{state.articles.length} articles available</Text>
      </View>
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBackToCategories}
      >
        <Icon name="arrow-left" size={20} color={activeTheme.colors.text} />
        <Text style={styles.backButtonText}>Back to Categories</Text>
      </TouchableOpacity>
      <FlatList
        data={sortedArticles}
        renderItem={renderArticleItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.articlesList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || state.isLoading}
            onRefresh={onRefresh}
            colors={['#E50914']}
            tintColor="#E50914"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="file-text" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No articles found</Text>
          </View>
        }
      />
    </View>
  );
}
