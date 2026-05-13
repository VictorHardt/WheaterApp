import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { HourData } from '../../types';
import { useAppTheme } from '../../hooks/useAppTheme';

interface HourlyChartProps {
  hourlyData: HourData[];
}

export const HourlyChart: React.FC<HourlyChartProps> = ({ hourlyData }) => {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  // Configuração dos dados pro gráfico com base no HourlyData
  const chartData = hourlyData.map((h, index) => ({
    value: h.temp_c,
    label: index % 4 === 0 ? h.time.split(' ')[1].substring(0, 5) : '', // Apenas de 4 em 4 horas no eixo X (ex: 00:00, 04:00, 08:00)
    dataPointText: `${Math.round(h.temp_c)}°`,
    textColor: theme.colors.textPrimary,
    labelTextStyle: { color: theme.colors.textSecondary },
  }));

  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        curved // Propriedade que suaviza a linha usando interpolação spline
        areaChart
        startFillColor="rgba(30, 136, 229, 0.3)"
        endFillColor="rgba(30, 136, 229, 0.0)"
        startOpacity={0.8}
        endOpacity={0.3}
        color={theme.colors.accentBlue}
        thickness={3}
        dataPointsColor={theme.colors.accentOrange}
        dataPointsRadius={4}
        textColor={theme.colors.textPrimary}
        textShiftY={-8}
        textShiftX={-4}
        textFontSize={11}
        width={screenWidth - 64} // Largura da tela menos padding
        height={220}
        initialSpacing={10}
        spacing={(screenWidth - 100) / 6} // Aproximadamente para caber os 6 pontos principais (4 em 4 horas)
        disableScroll={false}
        showScrollIndicator={true}
        indicatorColor={theme.isDarkMode ? 'white' : 'black'}
        nestedScrollEnabled={true}
        hideRules
        yAxisThickness={0}
        xAxisThickness={1}
        xAxisColor={theme.isDarkMode ? 'rgba(255,255,255,0.2)' : '#ccc'}
        hideYAxisText
        pointerConfig={{
          pointerStripHeight: 160,
          pointerStripColor: 'lightgray',
          pointerStripWidth: 2,
          pointerColor: 'lightgray',
          radius: 6,
          pointerLabelWidth: 80,
          pointerLabelHeight: 90,
          activatePointersOnLongPress: true,
          autoAdjustPointerLabelPosition: false,
          pointerLabelComponent: (items: any) => {
            return (
              <View style={styles.tooltip}>
                <Text style={styles.tooltipText}>{items[0].value}°</Text>
              </View>
            );
          },
        }}
      />
    </View>
  );
};

import { Text } from 'react-native';

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  container: {
    marginVertical: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.card,
    borderWidth: 1,
    borderColor: theme.isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    paddingRight: 32, // Para não cortar o último ponto
  },
  tooltip: {
    height: 36,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.sm,
    marginTop: -24,
    marginLeft: -30,
    borderWidth: 1,
    borderColor: theme.colors.accentBlue,
  },
  tooltipText: {
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.bold,
  },
});
