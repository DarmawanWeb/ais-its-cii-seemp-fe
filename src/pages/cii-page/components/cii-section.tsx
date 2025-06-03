import { FC } from "react";
import CiiValueCard from "../cii-value-card";
import { CardHeader, CardContent, Card } from "../../../components/ui/card";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
  Line,
  ReferenceArea,
  LineChart as RechartsLineChart,
} from "recharts";
import { ICIICalculation } from "../cii-value-card";

export type ciiGrafik = {
  ciiData: {
    ciiAttained: number;
    timestamp: string;
  }[];
  ddVector: {
    d1: number;
    d2: number;
    d3: number;
    d4: number;
  };
} | null;

export interface ICIISectionProps {
  ciiGrafik: ciiGrafik;
  ciiData: ICIICalculation | null;
  show: boolean;
}

const CIISection: FC<ICIISectionProps> = ({ ciiGrafik, ciiData, show }) => {
  const chartData =
    ciiGrafik?.ciiData.map((data) => ({
      timestamp: data.timestamp,
      ciiAttained: data.ciiAttained,
      d1: ciiGrafik.ddVector.d1,
      d2: ciiGrafik.ddVector.d2,
      d3: ciiGrafik.ddVector.d3,
      d4: ciiGrafik.ddVector.d4,
    })) || [];

  return (
    <section
      className={`absolute bottom-0  right-[28%] z-100 w-[72%] bg-slate-300 p-4 flex gap-3 h-[285px] ${
        show ? "flex" : "hidden"
      }`}
    >
      <Card className="w-full h-[260px] overflow-auto rounded-md border border-gray-300">
        <CardHeader className="bg-blue-200 text-black px-3 py-2">
          <h3 className="text-sm font-semibold text-center">CII Value</h3>
        </CardHeader>
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-1 p-2 bg-white h-56 rounded-b-xl">
            <div className="text-gray-400">No Data Available</div>
            <div className="text-xs text-gray-600">Data will appear here</div>
          </div>
        ) : (
          <CardContent className="px-3 space-y-2 bg-white h-56 rounded-b-xl">
            <ResponsiveContainer className="h-full">
              <RechartsLineChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="timestamp"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={0}
                  fontSize={10}
                />
                <YAxis
                  tickLine={false}
                  domain={[
                    25,
                    () => {
                      const maxLimit = ciiGrafik?.ddVector?.d4 ?? 100;
                      return maxLimit + 20;
                    },
                  ]}
                  hide={true}
                />
                <Legend />
                <ReferenceArea
                  y1={ciiGrafik?.ddVector.d4}
                  y2={
                    ciiGrafik?.ddVector.d4 !== undefined
                      ? ciiGrafik.ddVector.d4 + 20
                      : 100
                  }
                  fill="red"
                  fillOpacity={0.3}
                />
                <ReferenceArea
                  y1={1}
                  y2={ciiGrafik?.ddVector.d1}
                  fill="blue"
                  fillOpacity={0.4}
                />
                <ReferenceArea
                  y1={ciiGrafik?.ddVector.d1}
                  y2={ciiGrafik?.ddVector.d2}
                  fill="green"
                  fillOpacity={0.3}
                />
                <ReferenceArea
                  y1={ciiGrafik?.ddVector.d2}
                  y2={ciiGrafik?.ddVector.d3}
                  fill="yellow"
                  fillOpacity={0.3}
                />
                <ReferenceArea
                  y1={ciiGrafik?.ddVector.d3}
                  y2={ciiGrafik?.ddVector.d4}
                  fill="orange"
                  fillOpacity={0.5}
                />

                <Line
                  type="monotone"
                  dataKey="ciiAttained"
                  stroke="black"
                  strokeWidth={2}
                  dot={{ r: 1 }}
                />
                <Line
                  type="monotone"
                  dataKey="d1"
                  stroke="gray"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="d2"
                  stroke="gray"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="d3"
                  stroke="gray"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="d4"
                  stroke="gray"
                  strokeWidth={2}
                  dot={false}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        )}
      </Card>
      <CiiValueCard cii={ciiData} />
    </section>
  );
};

export default CIISection;
