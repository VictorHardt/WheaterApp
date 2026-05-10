import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
    const router = useRouter();

    const goToDetails = (date: string) => {
        router.push(`/details/${date}`);
    };

    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Text style={{ fontSize: 24, marginBottom: 20, fontWeight: 'bold' }}>Weather App</Text>
            <Button title="Ver detalhes de 2024-01-15" onPress={() => goToDetails('2024-01-15')} />
        </View>
    );
}