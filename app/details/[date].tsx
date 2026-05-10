import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function DetailsScreen() {
  const { date } = useLocalSearchParams();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20 }}>Detalhes para: {date}</Text>
    </View>
  );
}
