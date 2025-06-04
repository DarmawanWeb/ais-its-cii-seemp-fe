import { FC } from "react";
import { Card, CardHeader, CardContent } from "../../../components/ui/card";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "../../../components/ui/button";
import { AnnualCIIWithDDVector } from "./cii-value-card";
import DataNotFound from "../../../components/common/data-not-found";

interface SEEMPChartProps {
  showTable: boolean;
  toggleTableVisibility: () => void;
  ciis: AnnualCIIWithDDVector[];
}

const SEEMPChart: FC<SEEMPChartProps> = ({
  ciis,
  showTable,
  toggleTableVisibility,
}) => {
  const chartData = ciis.map((cii) => ({
    year: cii.year,
    ciiAttained: cii.ciiAttained,
    d1: cii.ddVector.d1,
    d2: cii.ddVector.d2,
    d3: cii.ddVector.d3,
    d4: cii.ddVector.d4,
  }));

  return (
    <Card className="row-span-5 h-full overflow-auto rounded-md border border-gray-300">
      <CardHeader className="bg-blue-200 text-black px-3 py-2">
        <h3 className="text-sm font-semibold text-center">CII Grafik</h3>
      </CardHeader>
      <CardContent className="px-3 h-44 space-y-2 text-xs">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <DataNotFound />
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="year"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={6}
                  fontSize={10}
                />
                <Legend />
                <Line
                  dataKey="ciiAttained"
                  fill="#000000"
                  stroke="#000000"
                  strokeWidth={2}
                  baseLine={0}
                  dot={{ r: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="d1"
                  stroke="#ff7300"
                  strokeWidth={1}
                  dot={{ r: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="d2"
                  stroke="#00C49F"
                  strokeWidth={1}
                  dot={{ r: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="d3"
                  stroke="#FF8042"
                  strokeWidth={1}
                  dot={{ r: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="d4"
                  stroke="#8B0000"
                  strokeWidth={1}
                  dot={{ r: 0 }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
            <Button
              onClick={toggleTableVisibility}
              size="xs"
              className="text-xs w-full py-2  -mt-2"
            >
              {showTable ? "Close Recommendation" : "SEEMP Recommendation"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SEEMPChart;
