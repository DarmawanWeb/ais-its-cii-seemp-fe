import { FC, useState, useEffect } from "react";
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
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
  Legend,
  Line,
  LineChart as RechartsLineChart,
} from "recharts";
import SeempTable from "./components/seemp-table";
import PageTitle from "../../components/common/page-title";
import MapComponent from "../../components/common/map";
import Sidebar from "../../components/common/sidebar";

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

  const [_, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [currentItems, setCurrentItems] = useState<ISeempTableProps["seemp"]>(
    []
  );

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const mmsiParam = urlParams.get("mmsi");
    const pageParam = urlParams.get("page");

    if (mmsiParam) {
      setSelectedMmsi(mmsiParam);
    }

    const pageNumber = pageParam ? Number(pageParam) : 1;
    setCurrentPage(pageNumber);

    const indexOfLastItem = pageNumber * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    setCurrentItems(
      dummySeempData.seemp.slice(indexOfFirstItem, indexOfLastItem)
    );

    window.scrollTo(0, 0);
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
      {
        recommendation: "Use renewable energy sources.",
        ciiBefore: 17.2,
        ciiAfter: 13.5,
        costEstimation: "$5000",
      },
      {
        recommendation: "Install advanced route navigation.",
        ciiBefore: 14.5,
        ciiAfter: 12.1,
        costEstimation: "$2200",
      },
      {
        recommendation: "Regular maintenance for fuel efficiency.",
        ciiBefore: 19.0,
        ciiAfter: 15.8,
        costEstimation: "$1700",
      },
      {
        recommendation: "Reduce ship speed during off-peak hours.",
        ciiBefore: 15.5,
        ciiAfter: 13.0,
        costEstimation: "$1400",
      },
      {
        recommendation: "Invest in waste heat recovery.",
        ciiBefore: 14.0,
        ciiAfter: 12.0,
        costEstimation: "$2400",
      },
    ],
  };

  const chartData =
    ciiData?.map((cii) => ({
      year: `${cii.year}`,
      ciiRequired: cii.ciiRequired,
      ciiAttained: cii.ciiAttained,
      d1: cii.ddVector?.d1,
      d2: cii.ddVector?.d2,
      d3: cii.ddVector?.d3,
      d4: cii.ddVector?.d4,
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
                <h3 className="text-base font-semibold text-center">
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
                  <Button
                    onClick={toggleTableVisibility}
                    size={"xs"}
                    className="text-xs w-full py-2"
                  >
                    {showTable
                      ? "Close Recommendation"
                      : "SEEMP Recommendation"}
                  </Button>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </section>

      {showTable && (
        <section className="h-64 absolute bottom-0 w-13/20 z-100 left-0 bg-slate-300 p-3 text-xs pl-5">
          <SeempTable seemp={currentItems} />
        </section>
      )}

      <PageTitle title="SEEMP Recommendation" />
      <Sidebar />
      <MapComponent markers={shipData} />
    </main>
  );
};

export default SEEMPPage;
