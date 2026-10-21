import { Chart } from '@inithium/shared-ui-composites';

const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

export default function ExampleChartBars() {
  return (
    <Chart
      type="bar"
      label="Revenue by month, online and in store"
      labels={months}
      series={[
        { label: 'Online', data: [1200, 1850, 1600, 2100, 2400, 2250] },
        { label: 'In store', data: [900, 950, 1100, 1000, 1300, 1250], color: { color: 'secondary', intensity: 500 } },
      ]}
      formatValue={(value) => `£${value.toLocaleString()}`}
    />
  );
}
