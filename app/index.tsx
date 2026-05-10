import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelectedCity } from '../src/hooks/useSelectedCity';
import { WeatherCard, LoadingSkeleton, ErrorState, SearchBar } from '../src/components';

export default function HomeScreen() {
  const router = useRouter();
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

  return (
    <SafeAreaView style={styles.container}>
      <SearchBar onCitySelect={setSelectedCity} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={['#1e88e5']} />
        }
      >
        <View style={styles.headerContainer}>
          <Text style={styles.cityTitle}>
            {forecast?.location.name || 'Buscando localização...'}
          </Text>
          {forecast?.location.region ? (
            <Text style={styles.regionTitle}>
              {forecast.location.region}, {forecast.location.country}
            </Text>
          ) : null}
        </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cityTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  regionTitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
    textAlign: 'center',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999999',
  },
});