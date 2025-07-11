# SwipeNews Personalization System

## Overview

The SwipeNews app now includes a comprehensive personalization engine that learns from user behavior to deliver increasingly relevant news content. The system tracks user interactions, builds preference profiles, and scores articles to create personalized feeds.

## Key Features

### 1. User Behavior Tracking
- **Reading Analytics**: Tracks articles read, time spent, and reading patterns
- **Interaction Tracking**: Monitors saves, shares, and skips
- **Swipe Pattern Analysis**: Learns from up/down swipe behaviors
- **Time-based Preferences**: Identifies preferred reading times

### 2. Dynamic User Profiling
- **Category Preferences**: Weighted preferences for news categories
- **Source Preferences**: Trust and preference scores for news sources
- **Behavioral Data**: Reading habits and engagement patterns
- **Adaptive Learning**: Preferences evolve with continued usage

### 3. Article Scoring & Ranking
- **Relevance Scoring**: Based on user's category and source preferences
- **Diversity Scoring**: Ensures variety in the feed
- **Recency Scoring**: Prioritizes fresh content
- **Final Scoring**: Weighted combination of all factors

### 4. Offline Support
- **Offline Tracking**: Stores interactions when network is unavailable
- **Data Synchronization**: Syncs offline data when connection is restored
- **Fallback Mechanisms**: Graceful degradation for network issues

### 5. Personalized Feed Types
- **Full Personalization**: For experienced users with established preferences
- **Balanced Feed**: For new users with minimal interaction data
- **Category-specific**: Personalized content within selected categories
- **Trending Articles**: Popular content with personalization overlay

## Architecture

### Core Services

#### UserProfileService
- Manages user preference profiles
- Handles CRUD operations for user data
- Applies time-based decay to preferences
- Stores data in Firebase Firestore

#### PersonalizationEngine
- Scores articles based on user profiles
- Applies diversity constraints
- Generates personalized article rankings
- Provides scoring explanations

#### PersonalizedNewsService
- Orchestrates personalized content delivery
- Handles different feed types
- Manages fallback scenarios
- Integrates with existing news service

#### OfflinePersonalizationService
- Manages offline data storage
- Handles interaction queuing
- Syncs data when online
- Provides offline profile management

### Context Providers

#### PersonalizationContext
- Manages personalization settings
- Provides user statistics
- Handles configuration updates
- Offers reset functionality

#### Enhanced AnalyticsContext
- Tracks detailed user interactions
- Supports offline mode
- Handles data synchronization
- Provides comprehensive analytics

## User Experience

### For New Users
1. **Onboarding**: Existing preferences screen for initial setup
2. **Balanced Feed**: Curated mix across categories
3. **Learning Phase**: System learns from early interactions
4. **Gradual Personalization**: Feed becomes more tailored over time

### For Experienced Users
1. **Highly Personalized**: Feed reflects established preferences
2. **Diversity Balance**: Maintains variety while respecting preferences
3. **Continuous Learning**: Adapts to changing interests
4. **Preference Transparency**: Users can view their reading statistics

### Interaction Patterns
- **Swipe Up**: Save article (strong positive signal)
- **Swipe Down**: Skip article (mild negative signal)
- **Read Time**: Longer reading indicates interest
- **Share Action**: Strong positive signal for content type

## Configuration

### Personalization Settings
```typescript
interface PersonalizationConfig {
  categoryWeightDecay: number;      // 0.95 (5% decay per week)
  minInteractionsForPreference: number; // 3 interactions minimum
  diversityFactor: number;          // 0.3 (30% weight for diversity)
  recencyBoost: number;            // 0.2 (20% boost for recent articles)
  maxArticlesPerCategory: number;   // 3 articles max per category
}
```

### Weight Changes by Interaction
- **Save**: +0.15 (strong positive)
- **Share**: +0.12 (strong positive)
- **Read**: +0.08 (moderate positive)
- **Skip**: -0.05 (mild negative)

## Data Storage

### User Profile Structure
```typescript
interface UserProfile {
  userId: string;
  language: string;
  region: string;
  categoryPreferences: CategoryPreference[];
  sourcePreferences: SourcePreference[];
  behaviorData: UserBehaviorData;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}
```

### Storage Locations
- **Online**: Firebase Firestore (`userProfiles` collection)
- **Offline**: AsyncStorage for local caching
- **Interactions**: Queued locally when offline

## Privacy & Data Handling

### Data Collection
- All personalization data is tied to user accounts
- Anonymous users get balanced feeds without tracking
- No personal information beyond reading preferences
- Data is used solely for content personalization

### User Control
- Users can view their reading statistics
- Personalization can be disabled
- Complete profile reset available
- Transparent preference display

## Performance Considerations

### Optimization Strategies
- **Lazy Loading**: Profile data loaded on demand
- **Caching**: Frequent data cached locally
- **Batch Operations**: Multiple interactions processed together
- **Fallback Mechanisms**: Graceful degradation for failures

### Scalability
- **Singleton Services**: Efficient resource usage
- **Configurable Limits**: Adjustable performance parameters
- **Background Sync**: Non-blocking data synchronization
- **Error Handling**: Robust error recovery

## Future Enhancements

### Planned Features
1. **Machine Learning**: Advanced recommendation algorithms
2. **Social Features**: Friend recommendations and sharing
3. **Trending Analysis**: Real-time popularity scoring
4. **Content Similarity**: Article similarity matching
5. **Push Notifications**: Personalized notification timing
6. **A/B Testing**: Personalization algorithm testing

### Analytics Improvements
1. **Reading Depth**: Scroll-based engagement tracking
2. **Session Analysis**: Reading session patterns
3. **Retention Metrics**: Long-term engagement tracking
4. **Conversion Tracking**: Action completion rates

## Implementation Notes

### Integration Points
- Seamlessly integrated with existing feed system
- Backward compatible with non-personalized flows
- Minimal impact on existing UI components
- Progressive enhancement approach

### Error Handling
- Graceful fallback to non-personalized content
- Offline mode with local storage
- Network error recovery
- Data corruption protection

### Testing Strategy
- Unit tests for core algorithms
- Integration tests for data flow
- Performance tests for large datasets
- User acceptance testing for UX

## Usage Examples

### Basic Implementation
```typescript
// Get personalized articles
const personalizedNewsService = PersonalizedNewsService.getInstance();
const articles = await personalizedNewsService.fetchPersonalizedArticles(
  userId, 
  'en', 
  'india', 
  undefined, 
  50
);

// Track user interaction
const { trackArticleRead } = useAnalytics();
await trackArticleRead(articleId, category, source, readingTime);
```

### Configuration Updates
```typescript
const { updateConfig } = usePersonalization();
updateConfig({
  diversityFactor: 0.4, // Increase diversity
  recencyBoost: 0.3     // Boost recent content more
});
```

### Offline Support
```typescript
const { setOfflineMode, syncOfflineData } = useAnalytics();

// Enable offline mode
setOfflineMode(true);

// Sync when back online
await syncOfflineData();
```

This personalization system transforms SwipeNews from a generic news app into an intelligent, adaptive platform that learns and evolves with each user's preferences, delivering increasingly relevant and engaging content over time.