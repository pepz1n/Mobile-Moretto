import React, { useState } from 'react';
import { Tabs } from 'expo-router';
import { Provider, useSelector } from 'react-redux';
import store from '../../constants/store';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

function TabLayoutWithStore() {
  const colorScheme = useColorScheme();
  const user = useSelector((state) => state.user);

  return (
    
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: `Home - ${user.name || 'Visitante'}`,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return (
    <Provider store={store}>
      <TabLayoutWithStore />
    </Provider>
  );
}
