import { Theme } from '@/constants/Theme';
import React from 'react';
import { TextInput as RNTextInput, TextInputProps as RNTextInputProps, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export default function TextInput({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  ...props
}: TextInputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <RNTextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : undefined,
            rightIcon ? styles.inputWithRightIcon : undefined,
            style,
          ]}
          placeholderTextColor={Theme.colors.text.tertiary}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.md,
  },
  label: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.text.secondary,
    fontWeight: '600',
    marginBottom: Theme.spacing.xs,
    marginLeft: Theme.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    borderWidth: 1.5,
    borderColor: Theme.colors.border.light,
    height: Theme.components.input.height,
    paddingHorizontal: Theme.spacing.md,
  },
  inputError: {
    borderColor: Theme.colors.danger,
  },
  input: {
    flex: 1,
    ...Theme.typography.body,
    color: Theme.colors.text.primary,
    paddingVertical: 0,
  },
  inputWithLeftIcon: {
    marginLeft: Theme.spacing.sm,
  },
  inputWithRightIcon: {
    marginRight: Theme.spacing.sm,
  },
  leftIcon: {
    marginRight: Theme.spacing.xs,
  },
  rightIcon: {
    marginLeft: Theme.spacing.xs,
  },
  errorText: {
    ...Theme.typography.caption,
    color: Theme.colors.danger,
    marginTop: Theme.spacing.xs,
    marginLeft: Theme.spacing.xs,
  },
});
