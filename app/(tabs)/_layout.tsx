// Tab Navigator Layout — with Lucide icons, Settings Menu, and transition prep
import React, { useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Colors } from '../../constants/theme';
import { Menu, Home, ShieldCheck, FileText, Zap, Radio, User } from 'lucide-react-native';
import { SettingsMenu } from '../../components/SettingsMenu';

type TabIconProps = {
  icon: React.ReactNode;
  label: string;
  focused: boolean;
};

function TabIcon({ icon, label, focused }: TabIconProps) {
  return (
    <View style={styles.tabItem}>
      <View style={[styles.iconWrapper, focused && styles.iconActive]}>
        {icon}
      </View>
      <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: true, // Show header for hamburger menu
          headerStyle: { backgroundColor: Colors.dark.background, shadowColor: 'transparent', elevation: 0 },
          headerTintColor: Colors.dark.textPrimary,
          headerTitle: '',
          headerLeft: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
                <Menu color={Colors.dark.textPrimary} size={28} />
              </TouchableOpacity>
              <Text style={styles.headerBrandLabel}>GigShield AI</Text>
            </View>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/profile')} style={{ marginRight: 20 }}>
              <User color={Colors.dark.textSecondary} size={24} />
            </TouchableOpacity>
          ),
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: false,
          // Slide-like transition for newer expo-router versions
          // @ts-ignore - 'shift' provides directional slide in newer React Navigation versions
          animation: 'shift',
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon 
                icon={<Home size={22} color={focused ? Colors.dark.lime : '#666'} />} 
                label="Home" 
                focused={focused} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="premium"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon 
                icon={<ShieldCheck size={22} color={focused ? Colors.dark.lime : '#666'} />} 
                label="Premium" 
                focused={focused} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="policy"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon 
                icon={<FileText size={22} color={focused ? Colors.dark.lime : '#666'} />} 
                label="Policy" 
                focused={focused} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="claims"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon 
                icon={<Zap size={22} color={focused ? Colors.dark.lime : '#666'} />} 
                label="Claims" 
                focused={focused} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="monitor"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon 
                icon={<Radio size={22} color={focused ? Colors.dark.lime : '#666'} />} 
                label="Monitor" 
                focused={focused} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            href: null,
          }}
        />
      </Tabs>
      
      <SettingsMenu 
        visible={menuVisible} 
        onClose={() => setMenuVisible(false)} 
      />
    </>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    marginLeft: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBrandLabel: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.dark.textPrimary,
    marginLeft: 8,
    letterSpacing: -0.5,
    textShadowColor: Colors.dark.lime,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  tabBar: {
    backgroundColor: Colors.dark.card,
    borderTopColor: Colors.dark.border,
    borderTopWidth: 1,
    height: 70,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minWidth: 65,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActive: {
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.dark.textTertiary,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: Colors.dark.lime,
  },
});
