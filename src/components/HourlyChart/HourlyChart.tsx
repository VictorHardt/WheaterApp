import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { HourData } from '../../types';

interface HourlyChartProps {
  hourlyData: HourData[];
}

export const HourlyChart: React.FC<HourlyChartProps> = ({ hourlyData }) => {
  // Configuração dos dados pro gráfico com base no HourlyData
  const chartData = hourlyData.map((h, index) => ({
    value: h.temp_c,
    label: index % 4 === 0 ? h.time.split(' ')[1].substring(0, 5) : '', // Apenas de 4 em 4 horas no eixo X (ex: 00:00, 04:00, 08:00)
    dataPointText: `${Math.round(h.temp_c)}°`,
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
        color="#1e88e5"
        thickness={3}
        dataPointsColor="#ff9800"
        dataPointsRadius={4}
        textColor="#555"
        textShiftY={-8}
        textShiftX={-4}
        textFontSize={11}
        width={screenWidth - 64} // Largura da tela menos padding
        height={220}
        initialSpacing={10}
        spacing={(screenWidth - 100) / 6} // Aproximadamente para caber os 6 pontos principais (4 em 4 horas)
        hideRules
        yAxisThickness={0}
        xAxisThickness={1}
        xAxisColor="#ccc"
        hideYAxisText
        pointerConfig={{
          pointerStripHeight: 160,
          pointerStripColor: 'lightgray',
          pointerStripWidth: 2,
          pointerColor: 'lightgray',
          radius: 6,
          pointerLabelWidth: 80,
          pointerLabelHeight: 90,
          activatePointersOnLongPress: false,
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

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingRight: 32, // Para não cortar o último ponto
  },
  tooltip: {
    height: 36,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 8,
    marginTop: -24,
    marginLeft: -30,
  },
  tooltipText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
