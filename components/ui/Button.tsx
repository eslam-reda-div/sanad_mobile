import { Theme } from '@/constants/Theme';
import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  
  const buttonStyles: ViewStyle[] = [
    styles.button,
    styles[`${size}Button`],
    styles[`${variant}Button`],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ].filter(Boolean) as ViewStyle[];
  
  const textStyles: TextStyle[] = [
    styles.text,
    styles[`${size}Text`],
    styles[`${variant}Text`],
    isDisabled && styles.disabledText,
    textStyle,
  ].filter(Boolean) as TextStyle[];
  
  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? Theme.colors.primary : '#fff'} />
      ) : (
        <>
          {icon}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Theme.radius.md,
    paddingHorizontal: Theme.spacing.lg,
    gap: Theme.spacing.sm,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      } as any,
      default: {
        ...Theme.shadows.sm,
      },
    }),
  },
  
  // Sizes
  smallButton: {
    height: 36,
    paddingHorizontal: Theme.spacing.md,
  },
  mediumButton: {
    height: 48,
    paddingHorizontal: Theme.spacing.lg,
  },
  largeButton: {
    height: 56,
    paddingHorizontal: Theme.spacing.xl,
  },
  
  // Variants
  primaryButton: {
    backgroundColor: Theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: Theme.colors.secondary,
  },
  dangerButton: {
    backgroundColor: Theme.colors.danger,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    ...Platform.select({
      web: {
        boxShadow: 'none',
      } as any,
      default: {
        shadowOpacity: 0,
        elevation: 0,
      },
    }),
  },
  ghostButton: {
    backgroundColor: 'transparent',
    ...Platform.select({
      web: {
        boxShadow: 'none',
      } as any,
      default: {
        shadowOpacity: 0,
        elevation: 0,
      },
    }),
  },
  
  // Text Styles
  text: {
    ...Theme.typography.button,
    textAlign: 'center',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  primaryText: {
    color: Theme.colors.text.inverse,
  },
  secondaryText: {
    color: Theme.colors.text.inverse,
  },
  dangerText: {
    color: Theme.colors.text.inverse,
  },
  outlineText: {
    color: Theme.colors.primary,
  },
  ghostText: {
    color: Theme.colors.primary,
  },
  
  // States
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
  fullWidth: {
    width: '100%',
  },
});
