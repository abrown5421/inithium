import { Chart } from '@inithium/shared-ui-composites';

const days = ['Oct 8', 'Oct 9', 'Oct 10', 'Oct 11', 'Oct 12', 'Oct 13', 'Oct 14', 'Oct 15', 'Oct 16', 'Oct 17', 'Oct 18', 'Oct 19', 'Oct 20', 'Oct 21'];
const members = [120, 122, 122, 125, 131, 134, 134, 138, 141, 147, 150, 151, 156, 162];

export default function ExampleChartLine() {
  return <Chart label="Members over the past fortnight" labels={days} series={[{ label: 'Members', data: members }]} area />;
}
