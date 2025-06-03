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
import { Seemp } from "../../types/seemp";
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
import Sidebar from "../../components/common/sidebar";

const SEEMPPage: FC = () => {
  const [shipData, setShipData] = useState<MarkerData[]>([]);
  const [shipDetailData, setShipDetailData] = useState<ShipData | null>(null);
  const [ciiData, setCiiData] = useState<Cii[] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredShips, setFilteredShips] = useState<MarkerData[]>([]);
  const [showTable, setShowTable] = useState(false);
  const [selectedMmsi, setSelectedMmsi] = useState<string | null>(null);
  const [seempData, setSeempData] = useState<ISeempTableProps | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [currentItems, setCurrentItems] = useState<Seemp[] | null>(null);

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

    if (seempData?.data) {
      const paginatedData = seempData.data.slice(
        indexOfFirstItem,
        indexOfLastItem
      );
      setCurrentItems(paginatedData);
    } else {
      setCurrentItems(null);
    }

    window.scrollTo(0, 0);
  }, [location.search, itemsPerPage, seempData?.data]);

  useEffect(() => {
    if (selectedMmsi) {
      const fetchData = async () => {
        try {
          const [shipResponse, ciiResponse, seempResponse] = await Promise.all([
            axios.get(`${VITE_BACKEND_URI}/vessels/details/${selectedMmsi}`),
            axios.get(`${VITE_BACKEND_URI}/annual-ciis/${selectedMmsi}`),
            axios.get(`${VITE_BACKEND_URI}/seemp/${selectedMmsi}`),
          ]);

          setCiiData(ciiResponse.data.data.ciis);
          setShipDetailData(shipResponse.data.data);

          setSeempData(seempResponse.data);
        } catch (err) {
          console.error("Error fetching data:", err);
        }
      };
      fetchData();
    }
  }, [selectedMmsi]);

  useEffect(() => {
    const fetchShipData = async () => {
      try {
        const response = await axios.get(`${VITE_BACKEND_URI}/ais`);
        setShipData(response.data.data);
        setFilteredShips(response.data.data);
      } catch (error) {
        console.error("Error fetching ship data:", error);
      }
    };

    fetchShipData();
  }, []);

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

  const totalPages =
    seempData?.data && seempData.data.length
      ? Math.ceil(seempData.data.length / itemsPerPage)
      : 1;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const indexOfLastItem = page * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    if (seempData?.data) {
      const paginatedData = seempData.data.slice(
        indexOfFirstItem,
        indexOfLastItem
      );
      setCurrentItems(paginatedData);
    }
  };

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
          <SeempTable data={currentItems} pageCount={totalPages} />
        </section>
      )}

      <PageTitle title="SEEMP Recommendation" />
      <Sidebar />
      <div className="pagination-controls">
        <Button
          disabled={currentPage <= 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Prev
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          disabled={currentPage >= totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </main>
  );
};

export default SEEMPPage;
