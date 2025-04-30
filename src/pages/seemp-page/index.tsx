import { FC, useState, useEffect } from "react";
import MapComponent from "../../components/common/map";
import Sidebar from "../../components/common/sidebar";
import PageTitle from "../../components/common/page-title";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { Search, LineChart } from "lucide-react";
import ShipInfoCard from "./components/ship-info-card";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import CiiValueCard from "./components/cii-value-card";
import { Button } from "../../components/ui/button";
import axios from "axios";
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
    <main className="h-screen w-screen relative bg-gray-300 overflow-hidden text-xs">
      <section className="absolute top-0 right-0 z-100 w-7/20 h-full bg-slate-300 p-3 rounded-l-xl">
        <div className="mb-2 mr-16 relative">
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

        <div className="grid grid-rows-9 gap-2 mb-4 mr-16 h-[88vh]">
          <ShipInfoCard shipData={shipDetailData} />
          <div className="grid grid-cols-2 gap-2 row-span-4">
            <CiiValueCard ciis={ciiData || []} />
            <Card>
              <CardHeader className="bg-blue-200 text-black p-2 -mt-6 rounded-t-md">
                <h3 className="text-xs font-semibold text-center">
                  CII Grafik
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
                    <AreaChart data={chartData}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="year"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={6}
                        fontSize={10}
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
                  <Button
                    onClick={toggleTableVisibility}
                    size={"xs"}
                    className="text-xs w-full py-2"
                  >
                    SEEMP Rcmnd
                  </Button>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </section>

      {showTable && (
        <section className="h-64 absolute bottom-0 w-13/20 z-100 left-0 bg-slate-300 p-3 text-xs">
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
