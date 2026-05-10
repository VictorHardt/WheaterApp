import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  FlatList, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator,
  Pressable,
  Dimensions
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useCitySearch } from '../../hooks/useCitySearch';
import { CitySearchResult } from '../../types';
import { useCityStore } from '../../store';

interface SearchBarProps {
  onCitySelect: (city: string | null) => void;
}

const { width, height } = Dimensions.get('window');

export const SearchBar: React.FC<SearchBarProps> = ({ onCitySelect }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const { selectedCity } = useCityStore();
  const queryClient = useQueryClient();

  const { results, isLoading, isError } = useCitySearch(debouncedQuery);

  // Implementação de Debounce
  // Análogo ao debounceTime do RxDart no Flutter. 
  // Evita disparar requisições para a API a cada caractere digitado.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);

    // Função de cleanup (análoga ao dispose)
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (city: CitySearchResult) => {
    // 1. Atualiza estado e salva no Zustand (persistência)
    onCitySelect(city.name);
    
    // 2. Limpa e fecha a lista
    setQuery('');
    setDebouncedQuery('');
    setIsFocused(false);
    
    // 3. Força nova busca (análogo ao refetch / notifyListeners)
    queryClient.invalidateQueries({ queryKey: ['weather'] });
  };

  const handleClear = () => {
    setQuery('');
    setDebouncedQuery('');
    if (selectedCity) {
      onCitySelect(null); // Volta para o GPS
      queryClient.invalidateQueries({ queryKey: ['weather'] });
    }
    setIsFocused(false);
  };

  const handleDismiss = () => {
    setIsFocused(false);
    setQuery('');
    setDebouncedQuery('');
  };

  // Lógica de exibição da cidade atual vs placeholder
  const showLocationIcon = !isFocused && selectedCity && query === '';
  const placeholderText = showLocationIcon ? selectedCity : "Buscar cidade...";
  const placeholderColor = showLocationIcon ? "#333333" : "#999999";

  return (
    <View style={styles.container}>
      {/* Backdrop transparente para capturar toques fora da lista */}
      {isFocused && (
        <Pressable 
          style={styles.backdrop} 
          onPress={handleDismiss} 
        />
      )}

      <View style={styles.inputContainer}>
        {showLocationIcon && (
          <Ionicons name="location-sharp" size={20} color="#1e88e5" style={styles.leftIcon} />
        )}
        
        <TextInput
          style={[
            styles.input, 
            showLocationIcon && { paddingLeft: 40 }
          ]}
          placeholder={placeholderText}
          placeholderTextColor={placeholderColor}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setIsFocused(true)}
          returnKeyType="search"
          autoCorrect={false}
        />
        
        {isLoading && query.length >= 2 && (
          <ActivityIndicator size="small" color="#1e88e5" style={styles.rightIcon} />
        )}
        
        {!isLoading && (selectedCity || query.length > 0) && (
          <TouchableOpacity onPress={handleClear} style={styles.rightIcon}>
            <Ionicons name="close-circle" size={20} color="#999999" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Lista de Sugestões / Dropdown */}
      {isFocused && debouncedQuery.length >= 2 && (
        <View style={styles.resultsContainer}>
          {isLoading && <ActivityIndicator style={styles.loader} color="#1e88e5" />}
          {isError && <Text style={styles.errorText}>Erro ao buscar cidades</Text>}
          {!isLoading && !isError && (!results || results.length === 0) && (
            <Text style={styles.noResultsText}>Nenhuma cidade encontrada</Text>
          )}
          
          {/* FlatList é otimizado para listas, diferente do ScrollView */}
          {/* O keyboardShouldPersistTaps="handled" é crucial para permitir o clique antes de esconder o teclado */}
          <FlatList
            data={results}
            keyExtractor={(item) => item.id.toString()}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultRegion}>{item.region}, {item.country}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  backdrop: {
    position: 'absolute',
    top: -height,
    left: -width,
    width: width * 3,
    height: height * 3,
    backgroundColor: 'transparent',
    zIndex: -1,
  },
  inputContainer: {
    position: 'relative',
    justifyContent: 'center',
    zIndex: 2,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  leftIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 3,
  },
  rightIcon: {
    position: 'absolute',
    right: 12,
    zIndex: 3,
    padding: 4,
  },
  resultsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    zIndex: 5,
  },
  loader: {
    padding: 16,
  },
  list: {
    maxHeight: 250,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  resultRegion: {
    fontSize: 14,
    color: '#777777',
    marginTop: 2,
  },
  errorText: {
    padding: 16,
    color: '#e53935',
    textAlign: 'center',
  },
  noResultsText: {
    padding: 16,
    color: '#777777',
    textAlign: 'center',
  },
});
