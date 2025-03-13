import { ChartData  } from 'chart.js';

export const generateChartData = (): ChartData<'line'> => ({
  labels: Array.from({ length: 10 }, (_, i) => i.toString()),
  datasets: [
    {
      label: 'Random Data',
      data: Array.from({ length: 10 }, () => Math.random() * 100),
      fill: false,
      backgroundColor: 'rgb(75, 192, 192)',
      borderColor: 'rgba(75, 192, 192, 0.2)',
    },
  ],
});