import { FC } from "react";
import { Card, CardHeader, CardContent } from "../../../components/ui/card";
import {
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  Legend,
  Line,
  LineChart as RechartsLineChart,
} from "recharts";
import DataNotFound from "../../../components/common/data-not-found";

export interface IFuelConsumption {
  timestamp: string;
  fuelConsumptionMeTon: number;
  fuelConsumptionAeTon: number;
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

  return (
    <Card className="row-span-5 overflow-auto rounded-md border border-gray-300 h-full">
      <CardHeader className="bg-blue-200 text-black px-3 py-2">
        <h3 className="text-sm font-semibold text-center">
          Telemetry Fuel Data
        </h3>
      </CardHeader>
      <CardContent className="px-3 h-full">
        <ResponsiveContainer>
          <RechartsLineChart data={fuel} width={500} height={300}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              fontSize={10}
            />
            <Legend className="text-xs" />
            <Line
              type="monotone"
              dataKey="fuelConsumptionMeTon"
              stroke="#000000"
              strokeWidth={2}
              dot={{ r: 1 }}
            />
            <Line
              type="monotone"
              dataKey="fuelConsumptionAeTon"
              stroke="#ff7300"
              strokeWidth={1}
              dot={{ r: 1 }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TelemetryChart;
