import {
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import i18n from '../src/i18n';
import { getStoredLanguage } from '../src/i18n/languagePreference';
import { queryClient } from '../src/lib/queryClient';
import { useAuthStore } from '../src/stores/authStore';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [languageReady, setLanguageReady] = useState(false);
  const role = useAuthStore((state) => state.role);

  useEffect(() => {
    getStoredLanguage()
      .then((stored) => {
        if (stored) return i18n.changeLanguage(stored);
      })
      .finally(() => setLanguageReady(true));
  }, []);

  if (!fontsLoaded || !languageReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          {/*
           * Donor / hospital / admin are mutually exclusive route subtrees.
           * Stack.Protected unmounts a whole group from the navigator when
           * its guard is false, so e.g. a signed-in donor cannot reach
           * (hospital) or (admin) screens by deep link, browser URL, or a
           * stale router.push — the routes simply don't exist in that
           * session's navigator. `role` is still routing-only (see
           * authStore.ts / docs/04SECURITY.md §3): this stops one role's UI
           * and mock data from rendering under another role's session, it is
           * not the authorization boundary. Real enforcement is Firestore
           * rules + custom claims, added when IAM/RBAC lands.
           *
           * (auth) and index stay unguarded — they hold no role-specific
           * data, and the donor onboarding flow (notifications/biometric/
           * profile-setup) runs under (auth) after setSignedIn() but before
           * the donor reaches (donor), so it must stay reachable while
           * `role` is already set.
           */}
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Protected guard={role === 'donor'}>
              <Stack.Screen name="(donor)" />
            </Stack.Protected>
            <Stack.Protected guard={role === 'hospital_staff' || role === 'hospital_admin'}>
              <Stack.Screen name="(hospital)" />
            </Stack.Protected>
            <Stack.Protected guard={role === 'system_admin'}>
              <Stack.Screen name="(admin)" />
            </Stack.Protected>
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
