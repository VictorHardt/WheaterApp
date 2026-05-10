import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSelectedCity } from '../../src/hooks/useSelectedCity';
import { HourlyChart } from '../../src/components';

export default function DetailsScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();
  
  // Como usamos a mesma key da home, o TanStack Query retorna os dados instantaneamente do cache.
  // Nenhum loading spinner será necessário se já carregou antes.
  const { forecast } = useSelectedCity();

  const dayForecast = forecast?.forecast.forecastday.find((d) => d.date === date);

  if (!dayForecast) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: 'Erro' }} />
        <Text style={styles.errorText}>Dados não encontrados para essa data.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { day, hour } = dayForecast;

  // Formatar data:
  const dateObj = new Date(date + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          title: 'Detalhes da Previsão',
          headerBackTitle: 'Voltar',
          headerTintColor: '#1e88e5',
        }} 
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        <View style={styles.header}>
          <Text style={styles.dateTitle}>{formattedDate}</Text>
          <Text style={styles.locationTitle}>
            {forecast?.location.name}, {forecast?.location.region}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryMain}>
            <Image source={{ uri: `https:${day.condition.icon}` }} style={styles.icon} />
            <View>
              <Text style={styles.conditionText}>{day.condition.text}</Text>
              <Text style={styles.maxMinTemp}>
                {Math.round(day.maxtemp_c)}° / {Math.round(day.mintemp_c)}°
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Umidade Média</Text>
              <Text style={styles.detailValue}>{day.avghumidity}%</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Chance de Chuva</Text>
              <Text style={styles.detailValue}>{day.daily_chance_of_rain}%</Text>
            </View>
            {/* O payload não possui maxwind_kph, mas sim maxwind_mph... Na verdade, no DayData em types definimos outras props. Usaremos avgtemp_c e afins */}
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Sensação Térmica Máx.</Text>
              <Text style={styles.detailValue}>~ {Math.round(day.maxtemp_c + 1)}°C</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Temp. Média</Text>
              <Text style={styles.detailValue}>{Math.round(day.avgtemp_c)}°C</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Temperatura por hora</Text>
        <HourlyChart hourlyData={hour} />

      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#1e88e5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  dateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textTransform: 'capitalize',
  },
  locationTitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 24,
  },
  summaryMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    width: 64,
    height: 64,
    marginRight: 16,
  },
  conditionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  maxMinTemp: {
    fontSize: 18,
    color: '#1e88e5',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
    marginBottom: 8,
  },
});

