import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSelectedCity } from '../../src/hooks/useSelectedCity';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { HourlyChart } from '../../src/components';

export default function DetailsScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();
  
  // Como usamos a mesma key da home, o TanStack Query retorna os dados instantaneamente do cache.
  // Nenhum loading spinner será necessário se já carregou antes.
  const { forecast } = useSelectedCity();
  const theme = useAppTheme();
  const styles = createStyles(theme);

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
          headerTintColor: theme.colors.accentBlue,
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTitleStyle: { color: theme.colors.textPrimary },
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

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  errorText: {
    fontSize: theme.typography.md,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
  },
  backButton: {
    backgroundColor: theme.colors.accentBlue,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.sm,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: theme.typography.bold,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  dateTitle: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.bold,
    color: theme.colors.textPrimary,
    textTransform: 'capitalize',
  },
  locationTitle: {
    fontSize: theme.typography.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  summaryCard: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: theme.spacing.lg,
  },
  summaryMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  icon: {
    width: 64,
    height: 64,
    marginRight: theme.spacing.md,
  },
  conditionText: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  maxMinTemp: {
    fontSize: theme.typography.lg,
    color: theme.colors.accentBlue,
    fontWeight: theme.typography.bold,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: theme.spacing.md,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    marginBottom: theme.spacing.md,
  },
  detailLabel: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  detailValue: {
    fontSize: theme.typography.md,
    fontWeight: theme.typography.semibold,
    color: theme.colors.textPrimary,
  },
  sectionTitle: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.bold,
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
});

