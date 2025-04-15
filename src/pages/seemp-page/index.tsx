import { FC, useState, useEffect } from "react";
import MapComponent from "../../components/common/map";
import Sidebar from "../../components/common/sidebar";
import PageTitle from "../../components/common/page-title";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { Search } from "lucide-react";
import ShipInfoCard from "./components/ship-info-card";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import CiiValueCard from "./components/cii-value-card";
import { Button } from "../../components/ui/button";
import axios from "axios";
import { LineChart } from "lucide-react";
import { VITE_BACKEND_URI } from "../../lib/env";
import { MarkerData } from "../../components/common/map";
import { ShipData } from "./components/ship-info-card";
import { Cii } from "./components/cii-value-card";
import { ISeempTableProps } from "./components/seemp-table";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import SeempTable from "./components/seemp-table";

const SEEMPPage: FC = () => {
  const [shipData, setShipData] = useState<MarkerData[]>([]);
  const [shipDetailData, setShipDetailData] = useState<ShipData | null>(null);
  const [ciiData, setCiiData] = useState<Cii[] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredShips, setFilteredShips] = useState(shipData);
  const [showTable, setShowTable] = useState(false);
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
          const [shipResponse, ciiResponse] = await Promise.all([
            axios.get(`${VITE_BACKEND_URI}/vessels/details/${selectedMmsi}`),
            axios.get(`${VITE_BACKEND_URI}/annual-ciis/${selectedMmsi}`),
          ]);
          setCiiData(ciiResponse.data.data.ciis);
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

  const toggleTableVisibility = () => {
    setShowTable((prev) => !prev);
  };

  const dummySeempData: ISeempTableProps = {
    seemp: [
      {
        recommendation: "Reduce fuel consumption by optimizing speed.",
        ciiBefore: 12.5,
        ciiAfter: 10.3,
        costEstimation: "$1500",
      },
      {
        recommendation: "Switch to eco-friendly fuel alternatives.",
        ciiBefore: 14.2,
        ciiAfter: 11.8,
        costEstimation: "$2500",
      },
      {
        recommendation: "Implement route optimization technology.",
        ciiBefore: 16.7,
        ciiAfter: 13.2,
        costEstimation: "$3000",
      },
      {
        recommendation: "Install energy-efficient equipment on the vessel.",
        ciiBefore: 18.9,
        ciiAfter: 15.4,
        costEstimation: "$2000",
      },
      {
        recommendation: "Implement route optimization technology.",
        ciiBefore: 16.7,
        ciiAfter: 13.2,
        costEstimation: "$3000",
      },
    ],
  };

  const chartData =
    ciiData?.map((cii) => ({
      year: `${cii.year}`,
      ciiRating: cii.ciiRating,
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
    <main className="h-screen w-screen relative bg-gray-100 overflow-hidden">
      <section className="absolute top-0 right-0 z-100 w-2/5 h-full bg-slate-300 p-4">
        <div className="mb-4 mr-20 relative">
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

        <div className="grid grid-rows-9 gap-2 mb-6 mr-20 h-[89vh]">
          <ShipInfoCard shipData={shipDetailData} />
          <div className="grid grid-cols-2 gap-2 row-span-4">
            <CiiValueCard ciis={ciiData || []} />
            <Card>
              <CardHeader className="bg-blue-200 text-black p-1 -mt-6 rounded-t-lg">
                <h3 className="text-xl font-semibold text-center">
                  CII Grafik
                </h3>
              </CardHeader>
              {chartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center space-y-2 h-full">
                  <LineChart className="text-gray-400" size={40} />
                  <div className="text-sm text-gray-600">
                    Data will appear here
                  </div>
                </div>
              ) : (
                <CardContent className="px-4 h-48 space-y-2">
                  <ResponsiveContainer className="h-full">
                    <AreaChart data={chartData} className="h-full">
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="year"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                      />
                      <Tooltip />
                      <Area
                        dataKey="ciiRating"
                        type="linear"
                        fill="var(--color-ciiRating)"
                        fillOpacity={0.4}
                        stroke="var(--color-ciiRating)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  <Button onClick={toggleTableVisibility}>
                    SEEMP Recomendation
                  </Button>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </section>

      {showTable && (
        <section className="h-80 absolute bottom-0 w-3/5 z-100 left-0 bg-slate-300 p-4">
          <SeempTable seemp={dummySeempData.seemp} />
        </section>
      )}

      <PageTitle title="SEEMP Recommendation" />
      <Sidebar />
      <MapComponent markers={shipData} />
    </main>
  );
};

export default SEEMPPage;
