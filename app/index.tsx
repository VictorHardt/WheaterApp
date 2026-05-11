import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, Alert, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSelectedCity } from '../src/hooks/useSelectedCity';
import { WeatherCard, LoadingSkeleton, ErrorState, SearchBar } from '../src/components';
import { useAppTheme } from '../src/hooks/useAppTheme';
import { useThemeStore } from '../src/store';
export default function HomeScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { themeMode, setThemeMode } = useThemeStore();
  const {
    forecast,
    isLoading,
    isError,
    isFromCache,
    lastUpdated,
    refetch,
    selectedCity,
    setSelectedCity,
    permissionStatus,
    isLocationLoading,
  } = useSelectedCity();

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (permissionStatus === 'denied' && !selectedCity) {
      Alert.alert(
        'Permissão Negada',
        'Usando São Paulo como localização padrão. Você pode buscar outra cidade na barra de pesquisa.'
      );
    }
  }, [permissionStatus, selectedCity]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const goToDetails = (date: string) => {
    router.push(`/details/${date}`);
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    const now = new Date().getTime();
    const diffInMinutes = Math.floor((now - lastUpdated) / 60000);
    
    if (diffInMinutes < 1) return 'Agora';
    return `Atualizado há ${diffInMinutes} min`;
  };

  const cycleTheme = () => {
    if (themeMode === 'system') setThemeMode('light');
    else if (themeMode === 'light') setThemeMode('dark');
    else setThemeMode('system');
  };

  const getThemeIcon = () => {
    if (themeMode === 'system') return 'settings-outline';
    if (themeMode === 'light') return 'sunny-outline';
    return 'moon-outline';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[theme.colors.accentBlue]} tintColor={theme.colors.accentBlue} />
        }
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={cycleTheme} style={styles.themeToggle}>
            <Ionicons name={getThemeIcon()} size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.cityTitleContainer}>
            <Ionicons name="location-sharp" size={24} color={theme.colors.textPrimary} />
            <Text style={styles.cityTitle}>
              {forecast?.location.name || 'Buscando localização...'}
            </Text>
          </View>
          {forecast?.location.region ? (
            <Text style={styles.regionTitle}>
              {forecast.location.region}, {forecast.location.country}
            </Text>
          ) : null}
        </View>

        <SearchBar onCitySelect={setSelectedCity} />

        {(isLoading || isLocationLoading) && !isRefreshing ? (
          <LoadingSkeleton />
        ) : isError ? (
          <ErrorState message="Não foi possível carregar os dados do clima." onRetry={refetch} />
        ) : forecast ? (
          <View>
            {forecast.forecast.forecastday.slice(0, 3).map((day, index) => (
              <WeatherCard
                key={day.date}
                forecastDay={day}
                isToday={index === 0}
                onPress={() => goToDetails(day.date)}
              />
            ))}
          </View>
        ) : null}

        {!isLoading && !isLocationLoading && forecast && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isFromCache ? '⚠️ Dados offline • ' : ''}{formatLastUpdated()}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.lg,
  },
  headerContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    alignItems: 'center',
    position: 'relative',
  },
  themeToggle: {
    position: 'absolute',
    right: theme.spacing.md,
    top: theme.spacing.md,
    zIndex: 10,
    padding: theme.spacing.xs,
  },
  cityTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityTitle: {
    fontSize: theme.typography.xl,
    fontWeight: theme.typography.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginLeft: theme.spacing.xs,
  },
  regionTitle: {
    fontSize: theme.typography.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  footer: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textMuted,
  },
});