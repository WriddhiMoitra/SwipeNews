import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Article } from '../types/Article';
import Icon from 'react-native-vector-icons/Feather';

interface NewsCardProps {
  article: Article;
  onSave: (articleId: string) => void;
  onShare: (articleUrl: string) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, onSave, onShare }) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{article.title}</Text>
        <Text style={styles.description}>{article.description}</Text>
        <Text style={styles.source}>{article.source_id}</Text>
        <Text style={styles.date}>
          {article.published_at.toLocaleDateString()} {article.published_at.toLocaleTimeString()}
        </Text>
      </View>
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onSave(article.id)}
        >
          <Icon
            name={article.saved ? 'bookmark' : 'bookmark'}
            size={24}
            color={article.saved ? '#E50914' : '#888'}
          />
          <Text style={styles.actionText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onShare(article.url)}
        >
          <Icon name="share-2" size={24} color="#888" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    margin: 10,
    height: 400,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  contentContainer: {
    padding: 15,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
    flex: 1,
  },
  source: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
});

export default NewsCard;
