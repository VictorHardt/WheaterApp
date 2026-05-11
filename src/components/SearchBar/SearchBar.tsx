import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  FlatList, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator,
  Pressable,
  Dimensions,
  Keyboard
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useCitySearch } from '../../hooks/useCitySearch';
import { CitySearchResult } from '../../types';
import { useCityStore } from '../../store';
import { useAppTheme } from '../../hooks/useAppTheme';

interface SearchBarProps {
  onCitySelect: (city: string | null) => void;
}

const { width, height } = Dimensions.get('window');

export const SearchBar: React.FC<SearchBarProps> = ({ onCitySelect }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const theme = useAppTheme();
  const styles = createStyles(theme);
  
  const { selectedCity, searchHistory, addSearchHistory, clearSearchHistory } = useCityStore();
  const queryClient = useQueryClient();
  const inputRef = useRef<TextInput>(null);

  const { results, isLoading, isError } = useCitySearch(debouncedQuery);

  // Implementação de Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (city: CitySearchResult) => {
    // Adiciona ao histórico do Zustand
    addSearchHistory(city);
    
    // Atualiza estado e notifica
    onCitySelect(city.name);
    
    // Limpa e fecha a lista
    setQuery('');
    setDebouncedQuery('');
    setIsFocused(false);
    Keyboard.dismiss();
    
    // Força nova busca
    queryClient.invalidateQueries({ queryKey: ['weather'] });
  };

  const handleClear = () => {
    setQuery('');
    setDebouncedQuery('');
    
    if (selectedCity) {
      onCitySelect(null); // Volta para o GPS
      queryClient.invalidateQueries({ queryKey: ['weather'] });
    }
    
    // IMPORTANTE: NÃO forçamos setIsFocused(false) aqui, senão o estado 
    // do React perde sincronia com o estado nativo do campo, deixando ele "morto".
    // Apenas focamos o campo de volta para ele digitar uma nova cidade.
    inputRef.current?.focus();
  };

  const handleDismiss = () => {
    setIsFocused(false);
    setQuery('');
    setDebouncedQuery('');
    Keyboard.dismiss();
  };

  // Lógica de exibição da cidade atual vs placeholder
  const showLocationIcon = !isFocused && selectedCity && query === '';
  const placeholderText = showLocationIcon ? selectedCity : "Buscar cidade...";
  const placeholderColor = showLocationIcon ? theme.colors.textPrimary : theme.colors.textSecondary;

  const isSearching = debouncedQuery.length >= 2;
  const displayData = isSearching ? results : searchHistory;

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
          <Ionicons name="location-sharp" size={20} color={theme.colors.accentBlue} style={styles.leftIcon} />
        )}
        
        <TextInput
          ref={inputRef}
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
        
        {isLoading && isSearching && (
          <ActivityIndicator size="small" color={theme.colors.accentBlue} style={styles.rightIcon} />
        )}
        
        {!isLoading && (selectedCity || query.length > 0) && (
          <TouchableOpacity onPress={handleClear} style={styles.rightIcon}>
            <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Lista de Sugestões / Dropdown (Histórico ou Resultados) */}
      {isFocused && (isSearching || searchHistory.length > 0) && (
        <View style={styles.resultsContainer}>
          {isLoading && isSearching && <ActivityIndicator style={styles.loader} color={theme.colors.accentBlue} />}
          {isError && isSearching && <Text style={styles.errorText}>Erro ao buscar cidades</Text>}
          {!isLoading && !isError && isSearching && (!results || results.length === 0) && (
            <Text style={styles.noResultsText}>Nenhuma cidade encontrada</Text>
          )}

          {!isSearching && searchHistory.length > 0 && (
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Buscas recentes</Text>
              <TouchableOpacity onPress={clearSearchHistory}>
                <Text style={styles.clearHistoryText}>Limpar</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <FlatList
            data={displayData}
            keyExtractor={(item) => item.id.toString()}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
                {!isSearching && <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} style={{ marginRight: 8 }} />}
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultName}>{item.name}</Text>
                  <Text style={styles.resultRegion}>{item.region}, {item.country}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
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
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    fontSize: theme.typography.md,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    ...theme.shadows.light,
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
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.xs,
    maxHeight: 300,
    ...theme.shadows.card,
    borderWidth: 1,
    borderColor: theme.isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    zIndex: 5,
  },
  loader: {
    padding: theme.spacing.md,
  },
  list: {
    maxHeight: 250,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
  },
  historyTitle: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semibold,
    color: theme.colors.textSecondary,
  },
  clearHistoryText: {
    fontSize: theme.typography.sm,
    color: theme.colors.accentBlue,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultName: {
    fontSize: theme.typography.md,
    fontWeight: theme.typography.medium,
    color: theme.colors.textPrimary,
  },
  resultRegion: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  errorText: {
    padding: theme.spacing.md,
    color: theme.colors.error,
    textAlign: 'center',
  },
  noResultsText: {
    padding: theme.spacing.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
