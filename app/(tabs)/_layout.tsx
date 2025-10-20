import { Theme } from '@/constants/Theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  focused: boolean;
}) {
  return (
    <View style={[styles.iconContainer, props.focused && styles.iconContainerActive]}>
      <FontAwesome 
        size={props.focused ? 24 : 22} 
        name={props.name} 
        color={props.color}
      />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: Theme.colors.text.tertiary,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: Theme.colors.surface,
          borderTopColor: 'transparent',
          borderTopWidth: 0,
          paddingBottom: Math.max(insets.bottom + 10, Platform.OS === 'ios' ? 20 : 8),
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 85 : 65 + Math.max(insets.bottom , 0),
          ...Platform.select({
            web: {
              boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.08)',
            } as any,
            default: {
              elevation: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 4,
          marginBottom: Platform.OS === 'ios' ? 0 : 2,
          letterSpacing: 0.2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}>
      <Tabs.Screen 
        name="home" 
        options={{ 
          title: 'Home', 
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="home" color={color} focused={focused} /> 
        }} 
      />
      <Tabs.Screen 
        name="helpers" 
        options={{ 
          title: 'Helpers', 
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="users" color={color} focused={focused} /> 
        }} 
      />
      <Tabs.Screen 
        name="calls" 
        options={{ 
          title: 'Calls', 
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="phone" color={color} focused={focused} /> 
        }} 
      />
      <Tabs.Screen 
        name="helpers-calls" 
        options={{ 
          title: 'Helper Calls', 
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="phone-square" color={color} focused={focused} /> 
        }} 
      />
      <Tabs.Screen 
        name="devices" 
        options={{ 
          title: 'Devices', 
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="mobile" color={color} focused={focused} /> 
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile', 
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="user-circle" color={color} focused={focused} /> 
        }} 
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    minWidth: 44,
    minHeight: 40,
  },
  iconContainerActive: {
    backgroundColor: `${Theme.colors.primary}15`, // 15 is 8% opacity in hex
  },
});
