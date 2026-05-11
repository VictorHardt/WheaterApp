import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, Alert, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
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
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[theme.colors.accentBlue]} tintColor={theme.colors.accentBlue} />
        }
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            onPress={cycleTheme} 
            style={styles.themeToggle}
            accessibilityLabel="Alternar tema"
            accessibilityRole="button"
          >
            <Ionicons name={getThemeIcon()} size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.cityTitleContainer}>
            <Ionicons name="location-sharp" size={24} color={theme.colors.textPrimary} />
            <Text style={styles.cityTitle}>
              {forecast?.location.name || 'Buscando localização...'}
            </Text>
            {isFromCache && (
              <View style={styles.offlineBadge}>
                <Ionicons name="cloud-offline" size={12} color={theme.colors.warning} />
                <Text style={styles.offlineText}>Offline</Text>
              </View>
            )}
          </View>
          {forecast?.location.region ? (
            <Text style={styles.regionTitle}>
              {forecast.location.region}, {forecast.location.country}
            </Text>
          ) : null}
        </View>

        {permissionStatus === 'denied' && !selectedCity && (
          <View style={styles.permissionBanner}>
            <Ionicons name="warning-outline" size={20} color={theme.colors.warning} style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.permissionText}>Localização desabilitada. Usando cidade padrão: São Paulo</Text>
              <TouchableOpacity onPress={() => Linking.openSettings()}>
                <Text style={styles.permissionButton}>Abrir Configurações</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <SearchBar onCitySelect={setSelectedCity} />

        {(isLoading || isLocationLoading) && !isRefreshing ? (
          <LoadingSkeleton />
        ) : isError ? (
          <ErrorState message="Não foi possível carregar os dados do clima." onRetry={refetch} />
        ) : forecast ? (
          <View>
            {forecast.forecast.forecastday.slice(0, 3).map((day, index) => (
              <WeatherCard
                key={`${forecast.location.name}-${day.date}`}
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
    </View>
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
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 183, 77, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: theme.spacing.sm,
  },
  offlineText: {
    fontSize: 10,
    fontWeight: theme.typography.bold,
    color: theme.colors.warning,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 183, 77, 0.1)',
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 183, 77, 0.3)',
  },
  permissionText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  permissionButton: {
    fontSize: theme.typography.sm,
    color: theme.colors.accentBlue,
    fontWeight: theme.typography.bold,
  },
});