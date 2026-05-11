import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

export const LoadingSkeleton: React.FC = () => {
  const animatedValue = useRef(new Animated.Value(0.3)).current;
  const theme = useAppTheme();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 0.7,
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

  const styles = createStyles(theme);

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

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: theme.isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    height: 120,
  },
  header: {
    height: 20,
    width: '40%',
    backgroundColor: theme.isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    marginBottom: theme.spacing.md,
  },
  body: {
    flexDirection: 'row',
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    marginRight: theme.spacing.md,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-around',
  },
  line: {
    height: 16,
    width: '80%',
    backgroundColor: theme.isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    borderRadius: 4,
  },
  shortLine: {
    height: 14,
    width: '50%',
    backgroundColor: theme.isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    borderRadius: 4,
  },
});
