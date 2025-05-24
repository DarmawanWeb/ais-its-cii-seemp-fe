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
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Line,
  ReferenceArea,
  LineChart as RechartsLineChart,
} from "recharts";

import { CiiData } from "./components/cii-value-card";

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

const CIIPage: FC = () => {
  const [shipData, setShipData] = useState<MarkerData[]>([]);
  const [shipDetailData, setShipDetailData] = useState<ShipData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [ciiData, setCiiData] = useState<CiiData>(null);
  const [ciiGrafik, setCiiGrafik] = useState<ciiGrafik>(null);
  const [filteredShips, setFilteredShips] = useState(shipData);
  const [selectedMmsi, setSelectedMmsi] = useState<string | null>(null);
  const [showCiiSection, setShowCiiSection] = useState(false);
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
      const fetchData = async () => {
        try {
          const [shipResponse, ciiResponse, ciiGrafik] = await Promise.all([
            axios.get(`${VITE_BACKEND_URI}/vessels/details/${selectedMmsi}`),
            axios.get(`${VITE_BACKEND_URI}/latest/${selectedMmsi}`),
            axios.get(`${VITE_BACKEND_URI}/latest/all/${selectedMmsi}`),
          ]);

          setCiiData(ciiResponse.data.data);
          setShipDetailData(shipResponse.data.data);
          setCiiGrafik(ciiGrafik.data.data);
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

  const chartData =
    ciiGrafik?.ciiData.map((data) => ({
      timestamp: data.timestamp,
      ciiAttained: data.ciiAttained,
      d1: ciiGrafik.ddVector.d1,
      d2: ciiGrafik.ddVector.d2,
      d3: ciiGrafik.ddVector.d3,
      d4: ciiGrafik.ddVector.d4,
    })) || [];

  const toggleCiiSection = () => {
    setShowCiiSection(!showCiiSection);
  };

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
          <ShipInfoCard shipData={shipDetailData} onClick={toggleCiiSection} />
        </div>
      </section>

      <section
        className={`absolute bottom-0 right-[28%] z-100 w-[72%] bg-slate-300 p-4 flex ${
          showCiiSection ? "flex" : "hidden"
        }`}
      >
        <div className="w-full h-68 mb-4 mr-4">
          <CardHeader className="bg-blue-200 text-black p-2 rounded-t-xl">
            <h3 className="text-base font-semibold text-center">CII Grafik</h3>
          </CardHeader>
          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-1  p-2 bg-white h-56 rounded-b-xl">
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
                  <Tooltip />
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
