import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Página não encontrada</Text>
      <Link href="/" style={{ color: 'blue' }}>Voltar para a home</Link>
    </View>
  );
}
