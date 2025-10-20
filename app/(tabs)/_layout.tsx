import { Theme } from '@/constants/Theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

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
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: Theme.colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: Theme.colors.surface,
          borderTopColor: 'transparent',
          borderTopWidth: 0,
          paddingBottom: Platform.OS === 'ios' ? 20 : 0,
          paddingTop: 6,
          height: Platform.OS === 'ios' ? 80 : 80,
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
          marginTop: 2,
          marginBottom: 0,
          letterSpacing: 0.2,
        },
        tabBarItemStyle: {
          paddingVertical: 0,
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
