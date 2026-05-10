import { View, Text } from 'react-native';
import { Link, Stack } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 20, marginBottom: 20 }}>Página não encontrada</Text>
        <Link href="/" style={{ color: 'blue', marginTop: 15, paddingVertical: 15 }}>
          Voltar para a home
        </Link>
      </View>
    </>
  );
}
