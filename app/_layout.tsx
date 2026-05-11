import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from '../src/hooks/queryClient';
import { useAppTheme } from '../src/hooks/useAppTheme';

export default function RootLayout() {
  const { colors, isDarkMode } = useAppTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <Stack 
          screenOptions={{ 
            headerShown: false,
            contentStyle: { backgroundColor: colors.background } 
          }} 
        />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}