import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import TextInput from '@/components/ui/TextInput';
import { Theme } from '@/constants/Theme';
import { authApi } from '@/src/api/services';
import { useAuthStore } from '@/src/store/authStore';
import { FontAwesome } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as yup from 'yup';

const schema = yup.object().shape({
  identifier: yup.string().required('Email or phone number required'),
  password: yup.string().min(6, 'At least 6 characters').required('Password required'),
});

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();
  const { control, handleSubmit, formState: { errors } } = useForm({ 
    resolver: yupResolver(schema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await authApi.login({
        identifier: data.identifier,
        password: data.password,
      });
      
      if (response.success && response.data) {
        await login(response.data.token, response.data.customer);
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Login Failed', response.message || 'Unable to login');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Unable to connect to server';
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#6366F1', '#8B5CF6', '#A855F7']}
      style={styles.gradient}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Logo/Icon Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <FontAwesome name="heartbeat" size={48} color="#fff" />
          </View>
          <Text style={styles.title}>SANAD</Text>
          <Text style={styles.subtitle}>Patient Home Monitoring</Text>
        </View>

        {/* Login Card */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Welcome Back</Text>
          <Text style={styles.cardSubtitle}>Sign in to continue</Text>

          <Controller
            control={control}
            name="identifier"
            render={({ field }) => (
              <TextInput
                label="Email or Phone Number"
                placeholder="Enter your email or phone"
                value={field.value}
                onChangeText={field.onChange}
                autoCapitalize="none"
                error={errors.identifier?.message}
                leftIcon={<FontAwesome name="user" size={20} color={Theme.colors.text.tertiary} />}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <TextInput
                label="Password"
                placeholder="Enter your password"
                value={field.value}
                onChangeText={field.onChange}
                secureTextEntry
                error={errors.password?.message}
                leftIcon={<FontAwesome name="lock" size={20} color={Theme.colors.text.tertiary} />}
              />
            )}
          />


          <Button
            title={loading ? "Signing in..." : "Sign In"}
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            fullWidth
            style={styles.signInButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Create New Account"
            onPress={() => router.push('/auth/register')}
            variant="outline"
            fullWidth
          />
        </Card>

        <Text style={styles.footer}>
          By signing in, you agree to our Terms & Privacy Policy
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: Theme.spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: Theme.radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.md,
  },
  title: {
    ...Theme.typography.h1,
    color: Theme.colors.text.inverse,
    fontWeight: '800',
    marginBottom: Theme.spacing.xs,
  },
  subtitle: {
    ...Theme.typography.body,
    color: 'rgba(255,255,255,0.9)',
  },
  card: {
    marginBottom: Theme.spacing.lg,
  },
  cardTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  cardSubtitle: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.lg,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Theme.spacing.lg,
    marginTop: -Theme.spacing.sm,
  },
  forgotPasswordText: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  signInButton: {
    marginBottom: Theme.spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Theme.colors.border.light,
  },
  dividerText: {
    ...Theme.typography.caption,
    color: Theme.colors.text.tertiary,
    marginHorizontal: Theme.spacing.md,
    fontWeight: '600',
  },
  footer: {
    ...Theme.typography.caption,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    paddingHorizontal: Theme.spacing.xl,
  },
});

