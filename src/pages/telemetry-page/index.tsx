import { FC, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { Search, LineChart } from "lucide-react";
import ShipInfoCard from "./components/ship-info-card";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import axios from "axios";
import { VITE_BACKEND_URI } from "../../lib/env";
import { MarkerData } from "../../components/common/map";
import { ShipData } from "./components/ship-info-card";
import PageTitle from "../../components/common/page-title";
import MapComponent from "../../components/common/map";
import Sidebar from "../../components/common/sidebar";
import {
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
  Legend,
  Line,
  LineChart as RechartsLineChart,
} from "recharts";

interface FuelData {
  fuelME: number;
  fuelAE: number;
  timestamp: string;
}

const TelemetryPage: FC = () => {
  const [shipData, setShipData] = useState<MarkerData[]>([]);
  const [shipDetailData, setShipDetailData] = useState<ShipData | null>(null);
  const [fuelData, setFuelData] = useState<FuelData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredShips, setFilteredShips] = useState(shipData);
  const [selectedMmsi, setSelectedMmsi] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const mmsiParam = urlParams.get("mmsi");
    if (mmsiParam) {
      setSelectedMmsi(mmsiParam);
    }
  }, [location.search]);

  useEffect(() => {
    if (selectedMmsi) {
      const fetchData = async () => {
        try {
          const [shipResponse, fuelResponse] = await Promise.all([
            axios.get(`${VITE_BACKEND_URI}/vessels/details/${selectedMmsi}`),
            axios.get(`${VITE_BACKEND_URI}/latest/fuel/${selectedMmsi}`),
          ]);

          setFuelData(fuelResponse.data.data.fuelsData); // Set fetched fuel data
          setShipDetailData(shipResponse.data.data);
        } catch (err) {
          console.error("Error fetching data:", err);
        }
      };
      fetchData();
    }
  }, [selectedMmsi]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query === "") {
      setFilteredShips(shipData);
    } else {
      setFilteredShips(shipData.filter((ship) => ship.mmsi.includes(query)));
    }
  };

  const handleShipClick = (mmsi: string) => {
    navigate(`?mmsi=${mmsi}`);
    setSearchQuery("");
  };

  const chartData =
    fuelData?.map((fuel) => ({
      timestamp: fuel.timestamp,
      fuelME: fuel.fuelME,
      fuelAE: fuel.fuelAE,
    })) || [];

  useEffect(() => {
    const fetchShipData = async () => {
      try {
        const response = await axios.get(`${VITE_BACKEND_URI}/ais`);
        setShipData(response.data.data);
      } catch (error) {
        console.error("Error fetching ship data:", error);
      }
    };

    fetchShipData();
  }, []);

  return (
    <main className="h-screen w-screen relative bg-gray-300 overflow-hidden text-xs">
      <section className="absolute top-0 right-0 z-100 w-7/20 h-full bg-slate-300 p-3 rounded-l-xl">
        <div className="mb-2 mr-16 relative mt-2">
          <Input
            placeholder="Search ships..."
            className="w-full p-1 rounded-md border border-gray-400 bg-white pl-8 text-xs"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
            <Search className="text-gray-600" size={16} />
          </div>
          {searchQuery && filteredShips.length > 0 && (
            <div className="mt-2 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto absolute z-999 w-full text-xs">
              {filteredShips.map((ship) => (
                <div
                  key={ship.mmsi}
                  className="block px-3 py-1 hover:bg-gray-200 cursor-pointer"
                  onClick={() => handleShipClick(ship.mmsi)}
                >
                  {ship.mmsi}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-rows-9 gap-4 mb-4 mr-16 h-[88vh]">
          <ShipInfoCard shipData={shipDetailData} />
          <div className="h-full">
            <Card className="w-full h-68">
              <CardHeader className="bg-blue-200 text-black p-2 -mt-6 rounded-t-md">
                <h3 className="text-base font-semibold text-center">
                  Telemetry Fuel Data
                </h3>
              </CardHeader>
              {chartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center space-y-1 h-full p-2">
                  <LineChart className="text-gray-400" size={32} />
                  <div className="text-xs text-gray-600">
                    Data will appear here
                  </div>
                </div>
              ) : (
                <CardContent className="px-3 h-36 space-y-2">
                  <ResponsiveContainer className="h-full">
                    <RechartsLineChart data={chartData}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="timestamp"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={6}
                        fontSize={10}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="fuelME"
                        stroke="#000000"
                        strokeWidth={2}
                        dot={{ r: 1 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="fuelAE"
                        stroke="#ff7300"
                        strokeWidth={1}
                        dot={{ r: 1 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </section>

      <PageTitle title="Telemetry Data" />
      <Sidebar />
      <MapComponent markers={shipData} />
    </main>
  );
};

export default TelemetryPage;
