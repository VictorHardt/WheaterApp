import React, { useState } from 'react';
import { View, TextInput, StyleSheet, FlatList, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useCitySearch } from '../../hooks/useCitySearch';
import { CitySearchResult } from '../../types';

interface SearchBarProps {
  onCitySelect: (city: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onCitySelect }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { results, isLoading, isError } = useCitySearch(query);

  const handleSelect = (city: CitySearchResult) => {
    onCitySelect(city.name);
    setQuery('');
    setIsFocused(false);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Buscar cidade..."
        value={query}
        onChangeText={setQuery}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          // Pequeno delay para permitir o clique no resultado antes de fechar a lista
          setTimeout(() => setIsFocused(false), 200);
        }}
        returnKeyType="search"
      />
      
      {isFocused && query.length >= 2 && (
        <View style={styles.resultsContainer}>
          {isLoading && <ActivityIndicator style={styles.loader} color="#1e88e5" />}
          {isError && <Text style={styles.errorText}>Erro ao buscar cidades</Text>}
          {!isLoading && !isError && results?.length === 0 && (
            <Text style={styles.noResultsText}>Nenhuma cidade encontrada</Text>
          )}
          <FlatList
            data={results}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultRegion}>{item.region}, {item.country}</Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
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
  resultsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  loader: {
    padding: 16,
  },
  list: {
    maxHeight: 200,
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
