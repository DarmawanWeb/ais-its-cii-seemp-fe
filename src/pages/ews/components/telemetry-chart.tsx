import { FC } from "react";
import { Card, CardHeader, CardContent } from "../../../components/ui/card";
import {
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  Tooltip,
} from "recharts";
import DataNotFound from "../../../components/common/data-not-found";

export interface IFuelConsumption {
  timestamp: string;
  fuelME: number;
  fuelAE: number;
}

export interface TelemetryChartProps {
  fuel: IFuelConsumption[];
}

const TelemetryChart: FC<TelemetryChartProps> = ({ fuel }) => {
  if (!fuel || fuel.length === 0) {
    return (
      <Card className="row-span-5 overflow-auto rounded-md border border-gray-300 h-full">
        <CardHeader className="bg-blue-200 text-black px-3 py-2">
          <h3 className="text-sm font-semibold text-center">
            Telemetry Fuel Data
          </h3>
        </CardHeader>
        <CardContent className="px-3 h-full">
          <DataNotFound />
        </CardContent>
      </Card>
    );
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formattedData = fuel.map(item => ({
    ...item,
    formattedTimestamp: formatTimestamp(item.timestamp)
  }));

  return (
    <Card className="row-span-5 overflow-auto rounded-md border border-gray-300 h-full">
      <CardHeader className="bg-blue-200 text-black px-3 py-2">
        <h3 className="text-sm font-semibold text-center">
          Telemetry Fuel Data
        </h3>
      </CardHeader>
      <CardContent className="px-3 h-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={formattedData}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="formattedTimestamp"
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              fontSize={10}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              fontSize={10}
              tickLine={false}
              axisLine={false}
              label={{ value: 'Fuel (Ton)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              labelFormatter={(value) => `Time: ${value}`}
              formatter={(value: number, name: string) => [
                `${value.toFixed(2)} Ton`,
                name === 'fuelME' ? 'Main Engine' : 'Auxiliary Engine'
              ]}
            />
            <Legend 
              formatter={(value) => value === 'fuelME' ? 'Main Engine (ME)' : 'Auxiliary Engine (AE)'}
              wrapperStyle={{ fontSize: '12px' }}
            />
            <Line
              type="monotone"
              dataKey="fuelME"
              stroke="#000000"
              strokeWidth={2}
              dot={{ r: 2 }}
              name="fuelME"
            />
            <Line
              type="monotone"
              dataKey="fuelAE"
              stroke="#ff7300"
              strokeWidth={2}
              dot={{ r: 2 }}
              name="fuelAE"
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TelemetryChart;