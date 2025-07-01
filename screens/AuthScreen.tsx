import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signInAnonymously, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { googleOAuthConfig, exchangeGoogleCodeForToken } from '../config/googleSignIn';
import { useTheme } from '../contexts/ThemeContext';

export default function AuthScreen({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const { theme } = useTheme();
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
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Configure WebBrowser for authentication
  WebBrowser.maybeCompleteAuthSession();

  // Setup Google Sign-In using expo-auth-session hook
  const redirectUri = AuthSession.makeRedirectUri();
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: googleOAuthConfig.clientId,
      scopes: googleOAuthConfig.scopes,
      redirectUri: redirectUri,
      responseType: googleOAuthConfig.responseType,
      extraParams: googleOAuthConfig.extraParams,
    },
    {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    }
  );

  // Handle response from Google Sign-In
  useEffect(() => {
    if (response?.type === 'success' && response.params.code) {
      handleGoogleSignInResponse(response.params.code);
    } else if (response?.type === 'error') {
      setIsLoading(false);
      Alert.alert('Error', 'Google Sign-In failed. Please try again.');
    } else if (response?.type === 'cancel') {
      setIsLoading(false);
      console.log('Google Sign-In cancelled');
    }
  }, [response]);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    const auth = getAuth();

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        Alert.alert('Success', 'Logged in successfully!');
        onAuthSuccess();
      } else {
        if (!displayName) {
          Alert.alert('Error', 'Please enter your name.');
          setIsLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Update profile with display name if needed
        await updateProfile(userCredential.user, { displayName });
        Alert.alert('Success', 'Account created successfully!');
        onAuthSuccess();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await promptAsync();
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      Alert.alert('Error', error.message || 'Google Sign-In failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignInResponse = async (code: string) => {
    try {
      const googleCredential = await exchangeGoogleCodeForToken(code, redirectUri, request?.codeVerifier || '');
      const auth = getAuth();
      await signInWithCredential(auth, googleCredential);
      Alert.alert('Success', 'Logged in with Google successfully!');
      onAuthSuccess();
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      Alert.alert('Error', error.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setIsLoading(true);
    const auth = getAuth();
    try {
      await signInAnonymously(auth);
      Alert.alert('Success', 'Logged in anonymously!');
      onAuthSuccess();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Anonymous Sign-In failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setDisplayName('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.logoContainer}>
        <View style={styles.logoPlaceholder}>
          <Icon name="globe" size={50} color={activeTheme.colors.primary} />
        </View>
        <Text style={[styles.title, { color: activeTheme.colors.text }]}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>
        <Text style={[styles.subtitle, { color: activeTheme.colors.textSecondary }]}>{isLogin ? 'Login to continue reading news' : 'Sign up to get personalized news'}</Text>
      </View>
      <View style={styles.formContainer}>
        {!isLogin && (
          <View style={styles.inputContainer}>
            <Icon name="user" size={20} color={activeTheme.colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
            />
          </View>
        )}
        <View style={styles.inputContainer}>
          <Icon name="mail" size={20} color={activeTheme.colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color={activeTheme.colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleAuth}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
          <Text style={[styles.toggleText, { color: activeTheme.colors.primary }]}>
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
          </Text>
        </TouchableOpacity>
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>
        <TouchableOpacity
          style={[styles.googleButton, isLoading && styles.buttonDisabled]}
          onPress={handleGoogleSignIn}
          disabled={isLoading}
        >
          <View style={styles.googleIcon}>
            <Text style={styles.googleIconText}>G</Text>
          </View>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.providerButton, isLoading && styles.buttonDisabled]}
          onPress={handleAnonymousSignIn}
          disabled={isLoading}
        >
          <Icon name="user" size={20} color={activeTheme.colors.text} style={styles.providerIcon} />
          <Text style={styles.providerButtonText}>Sign in Anonymously</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 50,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#E50914',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#fafafa',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#1a1a1a',
  },
  button: {
    backgroundColor: '#E50914',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  toggleButton: {
    alignItems: 'center',
    padding: 10,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#a0a0a0',
    fontSize: 16,
  },
  providerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  providerIcon: {
    marginRight: 10,
  },
  providerButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dadce0',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  googleIconText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  googleButtonText: {
    color: '#3c4043',
    fontSize: 16,
    fontWeight: '500',
  },
});
