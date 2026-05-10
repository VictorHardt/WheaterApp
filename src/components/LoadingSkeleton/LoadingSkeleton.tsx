import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export const LoadingSkeleton: React.FC = () => {
  const animatedValue = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const SkeletonCard = () => (
    <Animated.View style={[styles.card, { opacity: animatedValue }]}>
      <View style={styles.header} />
      <View style={styles.body}>
        <View style={styles.icon} />
        <View style={styles.infoContainer}>
          <View style={styles.line} />
          <View style={styles.shortLine} />
          <View style={styles.shortLine} />
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    height: 140,
  },
  header: {
    height: 20,
    width: '40%',
    backgroundColor: '#cccccc',
    borderRadius: 4,
    marginBottom: 16,
  },
  body: {
    flexDirection: 'row',
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#cccccc',
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-around',
  },
  line: {
    height: 16,
    width: '80%',
    backgroundColor: '#cccccc',
    borderRadius: 4,
  },
  shortLine: {
    height: 14,
    width: '50%',
    backgroundColor: '#cccccc',
    borderRadius: 4,
  },
});
