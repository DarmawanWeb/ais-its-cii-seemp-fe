import { FC, useState, useEffect } from "react";
import MapComponent from "../../components/common/map";
import Sidebar from "../../components/common/sidebar";
import PageTitle from "../../components/common/page-title";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { Search } from "lucide-react";
import ShipInfoCard from "./components/ship-info-card";

import axios from "axios";
import { VITE_BACKEND_URI } from "../../lib/env";
import { MarkerData } from "../../components/common/map";
import { ShipData } from "./components/ship-info-card";
import CiiValueCard from "./components/cii-value-card";
import { CardHeader, CardContent } from "../../components/ui/card";
import {
  CartesianGrid,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Line,
  LineChart as RechartsLineChart,
} from "recharts";

const CIIPage: FC = () => {
  const [shipData, setShipData] = useState<MarkerData[]>([]);
  const [shipDetailData, setShipDetailData] = useState<ShipData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredShips, setFilteredShips] = useState(shipData);
  const [selectedMmsi, setSelectedMmsi] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const mmsiParam = urlParams.get("mmsi");
    if (mmsiParam) {
      setSelectedMmsi(mmsiParam);
    }
  }, [location.search]);

  useEffect(() => {
    if (selectedMmsi) {
      const fetchShipData = async () => {
        try {
          const response = await axios.get(
            `${VITE_BACKEND_URI}/vessels/details/${selectedMmsi}`
          );
          console.log("Ship detail data:", response.data.data);
          setShipDetailData(response.data.data);
        } catch (err) {
          console.error("Error fetching ship data:", err);
        }
      };

      fetchShipData();
    }
  }, [selectedMmsi]);

  const ciiData = {
    year: 2023,
    fuel: {
      fuelMe: 100,
      fuelAE: 68,
      total: 168,
    },
    cii: {
      ciiRequired: 80,
      ciiAttained: 75,
      ciiRating: 4.5,
      ciiGrade: "B",
    },
  };

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

  const chartData = [
    {
      year: `${ciiData.year}`,
      ciiRequired: ciiData.cii.ciiRequired,
      ciiAttained: ciiData.cii.ciiAttained,
      ciiRating: ciiData.cii.ciiRating,
      d1: 12.5, // Example data for d1, you can replace this with actual values
      d2: 11.5, // Example data for d2
      d3: 10.5, // Example data for d3
      d4: 9.5, // Example data for d4
    },
  ];

  return (
    <main className="h-screen w-screen relative bg-gray-300 overflow-hidden">
      <section className="absolute top-0 right-0 z-100 w-[28%] h-full bg-slate-300 p-4">
        <div className="mb-4 mr-16 relative">
          <Input
            placeholder="Search ships..."
            className="w-full p-3 rounded-lg border border-gray-400 bg-white pl-10"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Search className="text-gray-600" size={20} />
          </div>
          {searchQuery && filteredShips.length > 0 && (
            <div className="mt-2 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto absolute z-999 w-full">
              {filteredShips.map((ship) => (
                <div
                  key={ship.mmsi}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 cursor-pointer"
                  onClick={() => handleShipClick(ship.mmsi)}
                >
                  {ship.mmsi}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mr-16 h-[86vh]">
          <ShipInfoCard shipData={shipDetailData} />
        </div>
      </section>

      <section className="absolute bottom-0 right-[28%] z-100 w-[72%] bg-slate-300 p-4 flex">
        <div className="w-full h-68 mb-4  mr-4">
          <CardHeader className="bg-blue-200 text-black p-2 rounded-t-xl">
            <h3 className="text-base font-semibold text-center">CII Grafik</h3>
          </CardHeader>
          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-1 h-full p-2">
              <div className="text-gray-400">No Data Available</div>
              <div className="text-xs text-gray-600">Data will appear here</div>
            </div>
          ) : (
            <CardContent className="px-3  space-y-2 bg-white h-56 rounded-b-xl">
              <ResponsiveContainer className="h-full">
                <RechartsLineChart data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="year"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={6}
                    fontSize={10}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="ciiAttained"
                    stroke="#000000"
                    strokeWidth={2}
                    dot={{ r: 1 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="d1"
                    stroke="#ff7300"
                    strokeWidth={1}
                    dot={{ r: 1 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="d2"
                    stroke="#00C49F"
                    strokeWidth={1}
                    dot={{ r: 1 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="d3"
                    stroke="#FF8042"
                    strokeWidth={1}
                    dot={{ r: 1 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="d4"
                    stroke="#8B0000"
                    strokeWidth={1}
                    dot={{ r: 1 }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          )}
        </div>
        <CiiValueCard cii={ciiData} />
      </section>

      <PageTitle title="CII Calculation" />
      <Sidebar />
      <MapComponent markers={shipData} />
    </main>
  );
};

export default CIIPage;
