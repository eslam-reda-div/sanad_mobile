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
  name: yup.string().required('Name required'),
  email: yup.string().email('Invalid email').required('Email required'),
  phone_number: yup.string().required('Phone required'),
  age: yup.number().positive('Invalid age').integer('Invalid age'),
  disability: yup.string(),
  location: yup.string(),
  password: yup.string().min(6, 'At least 6 characters').required('Password required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match'),
});

export default function RegisterScreen() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();
  const { control, handleSubmit, formState: { errors } } = useForm({ 
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone_number: '',
      age: undefined,
      disability: '',
      location: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
        phone_number: data.phone_number,
        age: data.age,
        disability: data.disability || undefined,
        location: data.location || undefined,
      });
      
      if (response.success && response.data) {
        await login(response.data.token, response.data.customer);
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Registration Failed', response.message || 'Unable to register');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Unable to connect to server';
      const errors = err.response?.data?.data;
      
      if (errors && typeof errors === 'object') {
        const firstError = Object.values(errors)[0];
        Alert.alert('Registration Failed', Array.isArray(firstError) ? firstError[0] : errorMessage);
      } else {
        Alert.alert('Registration Failed', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#10B981', '#059669', '#047857']}
      style={styles.gradient}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <FontAwesome name="user-plus" size={40} color="#fff" />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join SANAD Health Monitoring</Text>
        </View>

        {/* Register Card */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <TextInput
                label="Full Name"
                placeholder="Enter your full name"
                value={field.value}
                onChangeText={field.onChange}
                error={errors.name?.message}
                leftIcon={<FontAwesome name="user" size={20} color={Theme.colors.text.tertiary} />}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <TextInput
                label="Email Address"
                placeholder="Enter your email"
                value={field.value}
                onChangeText={field.onChange}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email?.message}
                leftIcon={<FontAwesome name="envelope" size={20} color={Theme.colors.text.tertiary} />}
              />
            )}
          />

          <Controller
            control={control}
            name="phone_number"
            render={({ field }) => (
              <TextInput
                label="Phone Number"
                placeholder="Enter your phone number"
                value={field.value}
                onChangeText={field.onChange}
                keyboardType="phone-pad"
                error={errors.phone_number?.message}
                leftIcon={<FontAwesome name="phone" size={20} color={Theme.colors.text.tertiary} />}
              />
            )}
          />

          <Controller
            control={control}
            name="age"
            render={({ field }) => (
              <TextInput
                label="Age"
                placeholder="Enter your age"
                value={field.value?.toString()}
                onChangeText={(text) => field.onChange(text ? parseInt(text, 10) : undefined)}
                keyboardType="number-pad"
                error={errors.age?.message}
                leftIcon={<FontAwesome name="calendar" size={20} color={Theme.colors.text.tertiary} />}
              />
            )}
          />

          <Controller
            control={control}
            name="disability"
            render={({ field }) => (
              <TextInput
                label="Disability"
                placeholder="If applicable"
                value={field.value}
                onChangeText={field.onChange}
                leftIcon={<FontAwesome name="wheelchair" size={20} color={Theme.colors.text.tertiary} />}
              />
            )}
          />

          <Controller
            control={control}
            name="location"
            render={({ field }) => (
              <TextInput
                label="Location"
                placeholder="City, Country"
                value={field.value}
                onChangeText={field.onChange}
                leftIcon={<FontAwesome name="map-marker" size={20} color={Theme.colors.text.tertiary} />}
              />
            )}
          />

          <Text style={styles.sectionTitle}>Security</Text>

          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <TextInput
                label="Password"
                placeholder="Create a password"
                value={field.value}
                onChangeText={field.onChange}
                secureTextEntry
                error={errors.password?.message}
                leftIcon={<FontAwesome name="lock" size={20} color={Theme.colors.text.tertiary} />}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <TextInput
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={field.value}
                onChangeText={field.onChange}
                secureTextEntry
                error={errors.confirmPassword?.message}
                leftIcon={<FontAwesome name="lock" size={20} color={Theme.colors.text.tertiary} />}
              />
            )}
          />

          <Button
            title={loading ? "Creating Account..." : "Create Account"}
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            fullWidth
            variant="secondary"
            style={styles.registerButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Already have an account?</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Sign In Instead"
            onPress={() => router.push('/auth/login')}
            variant="outline"
            fullWidth
          />
        </Card>

        <Text style={styles.footer}>
          By creating an account, you agree to our Terms & Privacy Policy
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
    paddingTop: Theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
    marginTop: Theme.spacing.md,
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: Theme.radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.md,
  },
  title: {
    ...Theme.typography.h2,
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
    ...Theme.typography.h3,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.lg,
  },
  sectionTitle: {
    ...Theme.typography.h4,
    color: Theme.colors.text.primary,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  registerButton: {
    marginTop: Theme.spacing.md,
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
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    paddingHorizontal: Theme.spacing.xl,
    paddingBottom: Theme.spacing.xl,
  },
});
