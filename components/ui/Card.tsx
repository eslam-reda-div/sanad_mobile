import { Theme } from '@/constants/Theme';
import React from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export default function Card({ 
  children, 
  variant = 'elevated', 
  padding = 'md',
  style 
}: CardProps) {
  const cardStyles: ViewStyle[] = [
    styles.card,
    styles[`${variant}Card`],
    styles[`${padding}Padding`],
    style,
  ].filter(Boolean) as ViewStyle[];
  
  return <View style={cardStyles}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
  },
  
  // Variants
  defaultCard: {
    // No shadow, just background
  },
  elevatedCard: Platform.select({
    web: {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    } as any,
    default: {
      ...Theme.shadows.md,
    },
  }),
  outlinedCard: {
    borderWidth: 1,
    borderColor: Theme.colors.border.light,
  },
  
  // Padding
  nonePadding: {
    padding: 0,
  },
  smPadding: {
    padding: Theme.spacing.sm,
  },
  mdPadding: {
    padding: Theme.spacing.md,
  },
  lgPadding: {
    padding: Theme.spacing.lg,
  },
});
