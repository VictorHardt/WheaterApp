import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ForecastDay } from '../../types';

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
  
  // Calcula se é amanhã
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date === tomorrow.toISOString().split('T')[0];

  const dateLabel = formatDate(date, isToday, isTomorrow);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    textTransform: 'capitalize',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 64,
    height: 64,
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  conditionText: {
    fontSize: 16,
    color: '#555555',
    marginBottom: 4,
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  maxTemp: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e53935',
  },
  minTemp: {
    fontSize: 18,
    color: '#1e88e5',
  },
  humidity: {
    fontSize: 14,
    color: '#777777',
  },
});
