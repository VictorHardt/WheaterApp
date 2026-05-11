import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ForecastDay } from '../../types';
import { useAppTheme } from '../../hooks/useAppTheme';
interface WeatherCardProps {
  forecastDay: ForecastDay;
  isToday: boolean;
  onPress: () => void;
}

const formatDate = (dateString: string, isToday: boolean, isTomorrow: boolean) => {
  if (isToday) return 'Hoje';
  if (isTomorrow) return 'Amanhã';

  const date = new Date(dateString + 'T00:00:00'); // Evitar problemas de fuso
  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).replace('.', '');
};

export const WeatherCard: React.FC<WeatherCardProps> = ({ forecastDay, isToday, onPress }) => {
  const { day, date } = forecastDay;
  const theme = useAppTheme();
  const styles = createStyles(theme);
  
  // Calcula se é amanhã
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date === tomorrow.toISOString().split('T')[0];

  const dateLabel = formatDate(date, isToday, isTomorrow);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.cardWrapper}>
      <LinearGradient 
        colors={theme.colors.gradientCard} 
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.dateText}>{dateLabel}</Text>
        </View>
        
        <View style={styles.body}>
          <Image 
            source={{ uri: `https:${day.condition.icon}` }} 
            style={styles.icon} 
          />
          <View style={styles.infoContainer}>
            <Text style={styles.conditionText}>{day.condition.text}</Text>
            <View style={styles.tempContainer}>
              <Text style={styles.maxTemp}>{Math.round(day.maxtemp_c)}°</Text>
              <Text style={styles.minTemp}> / {Math.round(day.mintemp_c)}°</Text>
            </View>
            <Text style={styles.humidity}>Umidade: {day.avghumidity}%</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  cardWrapper: {
    marginVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    ...theme.shadows.card,
  },
  card: {
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: theme.isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    paddingBottom: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  dateText: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.bold,
    color: theme.colors.textPrimary,
    textTransform: 'capitalize',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 64,
    height: 64,
    marginRight: theme.spacing.md,
  },
  infoContainer: {
    flex: 1,
  },
  conditionText: {
    fontSize: theme.typography.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.xs,
  },
  maxTemp: {
    fontSize: 28,
    fontWeight: theme.typography.bold,
    color: theme.colors.textPrimary,
  },
  minTemp: {
    fontSize: theme.typography.lg,
    color: theme.colors.textSecondary,
  },
  humidity: {
    fontSize: theme.typography.sm,
    color: theme.colors.textMuted,
  },
});
