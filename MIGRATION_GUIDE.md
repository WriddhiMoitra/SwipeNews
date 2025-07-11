# SwipeNews Personalization Migration Guide

## Overview

This guide helps existing SwipeNews users and developers understand the changes introduced by the new personalization system and how to migrate existing data and workflows.

## What's New

### For Users
- **Personalized Feed**: Your news feed now adapts to your reading habits
- **Reading Statistics**: View your reading patterns and preferences
- **Improved Relevance**: Articles become more relevant over time
- **Offline Learning**: The app learns even when you're offline

### For Developers
- **New Services**: PersonalizationEngine, UserProfileService, PersonalizedNewsService
- **Enhanced Analytics**: More detailed user interaction tracking
- **Offline Support**: Robust offline data handling
- **New Contexts**: PersonalizationContext for settings management

## Breaking Changes

### None!
The personalization system is designed to be **fully backward compatible**. Existing users will continue to see the same experience initially, with personalization gradually improving as they use the app.

## Data Migration

### Existing Users
1. **Automatic Profile Creation**: New user profiles are created automatically on first use
2. **Preference Inheritance**: Existing user preferences (language, region) are preserved
3. **Gradual Learning**: The system starts learning from new interactions immediately
4. **No Data Loss**: All existing saved articles and preferences remain intact

### Database Changes
- **New Collections**: `userProfiles` collection added to Firestore
- **Existing Collections**: No changes to existing `articles` or `userPreferences` collections
- **Schema Compatibility**: All existing schemas remain unchanged

## API Changes

### New Exports
```typescript
// New services
import { UserProfileService } from './services/userProfileService';
import { PersonalizationEngine } from './services/personalizationEngine';
import { PersonalizedNewsService } from './services/personalizedNewsService';
import { OfflinePersonalizationService } from './services/offlinePersonalizationService';

// New contexts
import { usePersonalization } from './contexts/PersonalizationContext';

// Enhanced analytics
import { useAnalytics } from './contexts/AnalyticsContext'; // Now includes more methods
```

### Enhanced Methods
```typescript
// Analytics context now includes:
const {
  trackArticleRead,     // Enhanced with reading time
  trackArticleSaved,    // Unchanged
  trackArticleShared,   // Unchanged
  trackArticleSkipped,  // New method
  trackSwipeAction,     // New method
  trackTimeSpent,       // New method
  setOfflineMode,       // New method
  syncOfflineData       // New method
} = useAnalytics();
```

### Feed Context Changes
The FeedContext now automatically uses personalized feeds for authenticated users while maintaining the same API:

```typescript
// No changes needed - existing code continues to work
const { state, refreshFeed, markAsRead, toggleSaveArticle } = useFeed();
```

## Configuration

### Default Settings
The system comes with sensible defaults that work well for most users:

```typescript
const defaultConfig = {
  categoryWeightDecay: 0.95,        // 5% decay per week
  minInteractionsForPreference: 3,  // Need 3 interactions to establish preference
  diversityFactor: 0.3,             // 30% weight for diversity
  recencyBoost: 0.2,                // 20% boost for recent articles
  maxArticlesPerCategory: 3         // Max 3 articles per category in feed
};
```

### Customization
Developers can adjust these settings:

```typescript
const { updateConfig } = usePersonalization();

updateConfig({
  diversityFactor: 0.4,  // Increase diversity
  recencyBoost: 0.3      // Boost recent content more
});
```

## Testing Migration

### Existing Tests
All existing tests should continue to pass without modification. The personalization system doesn't break existing functionality.

### New Test Areas
Consider adding tests for:
1. **User Profile Creation**: Verify profiles are created for new users
2. **Preference Learning**: Test that interactions update preferences
3. **Article Scoring**: Verify articles are scored correctly
4. **Offline Functionality**: Test offline interaction storage
5. **Data Synchronization**: Test offline-to-online sync

### Test Data
Use the provided mock data in `tests/personalization.test.js` for testing personalization features.

## Performance Impact

### Minimal Overhead
- **Lazy Loading**: Personalization data is loaded only when needed
- **Efficient Caching**: Frequently accessed data is cached
- **Background Processing**: Heavy computations happen in the background
- **Graceful Degradation**: Falls back to non-personalized content if needed

### Memory Usage
- **Singleton Services**: Services are instantiated once and reused
- **Data Cleanup**: Old interaction data is automatically cleaned up
- **Configurable Limits**: Limits prevent excessive memory usage

## Rollout Strategy

### Phase 1: Silent Deployment
- Deploy with personalization enabled but not prominent
- Collect user interaction data
- Monitor system performance
- Gather initial feedback

### Phase 2: Gradual Exposure
- Show personalization features to subset of users
- A/B test different configurations
- Refine algorithms based on usage patterns
- Expand to more users

### Phase 3: Full Rollout
- Enable personalization for all users
- Promote personalization features
- Provide user education
- Monitor long-term engagement

## Monitoring & Analytics

### Key Metrics
1. **Engagement**: Time spent reading, articles per session
2. **Relevance**: User satisfaction with recommended content
3. **Performance**: Feed loading times, error rates
4. **Adoption**: Percentage of users with established preferences

### Alerts
Set up monitoring for:
- High error rates in personalization services
- Slow article scoring performance
- Failed offline data synchronization
- Unusual user behavior patterns

## Troubleshooting

### Common Issues

#### Personalization Not Working
1. Check if user is authenticated
2. Verify user has sufficient interaction history
3. Ensure personalization is enabled in settings
4. Check for network connectivity issues

#### Slow Feed Loading
1. Monitor article scoring performance
2. Check database query efficiency
3. Verify caching is working correctly
4. Consider reducing article batch sizes

#### Offline Sync Issues
1. Check AsyncStorage permissions
2. Verify network connectivity detection
3. Monitor sync error logs
4. Ensure proper error handling

### Debug Tools
```typescript
// Enable debug logging
const { getUserStats } = usePersonalization();
const stats = await getUserStats();
console.log('User personalization stats:', stats);

// Check offline data
const offlineService = OfflinePersonalizationService.getInstance();
const hasOfflineData = await offlineService.hasOfflineData();
console.log('Has offline data:', hasOfflineData);
```

## Support & Documentation

### Resources
- **API Documentation**: See individual service files for detailed API docs
- **Architecture Guide**: Review `PERSONALIZATION_README.md` for system overview
- **Test Examples**: Check `tests/personalization.test.js` for usage examples

### Getting Help
1. Check existing documentation first
2. Review error logs and console output
3. Test with mock data to isolate issues
4. Verify configuration settings

## Future Considerations

### Upcoming Features
- Machine learning-based recommendations
- Social features and friend recommendations
- Advanced analytics and insights
- Real-time trending analysis

### Deprecation Timeline
No existing features will be deprecated. The personalization system is purely additive and enhances existing functionality without removing anything.

## Conclusion

The SwipeNews personalization system is designed to enhance user experience without disrupting existing workflows. The migration is seamless for both users and developers, with the system gradually improving content relevance as users interact with the app.

For questions or issues during migration, refer to the troubleshooting section above or review the comprehensive documentation in `PERSONALIZATION_README.md`.