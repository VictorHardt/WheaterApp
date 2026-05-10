import { View, Text, Button } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';

export default function DetailsScreen() {
  const { date } = useLocalSearchParams();
  const router = useRouter();

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          title: `Previsão: ${date}`,
          headerBackTitle: 'Voltar', // No iOS, altera o texto do botão nativo
        }} 
      />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 20, marginBottom: 20 }}>Detalhes para: {date}</Text>
        <Button title="Voltar para Home" onPress={() => router.back()} />
      </View>
    </>
  );
}
