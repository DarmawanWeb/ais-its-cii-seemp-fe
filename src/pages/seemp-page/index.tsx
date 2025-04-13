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
import { LineChart } from "lucide-react";
import { Button } from "../../components/ui/button";
import axios from "axios";
import { VITE_BACKEND_URI } from "../../lib/env";
import { MarkerData } from "../../components/common/map";
import { ShipData } from "./components/ship-info-card";

const SEEMPPage: FC = () => {
  const [shipData, setShipData] = useState<MarkerData[]>([]);
  const [shipDetailData, setShipDetailData] = useState<ShipData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredShips, setFilteredShips] = useState(shipData);
  const [showTable, setShowTable] = useState(false);
  const [sortBy, setSortBy] = useState<"before" | "after">("before");
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
    console.log("Table visibility toggled:", !showTable);
  };

  const recommendations = [
    {
      id: 1,
      recommendation: "Improve fuel efficiency",
      ciiBefore: 65,
      ciiAfter: 60,
      costEstimation: "$2000",
    },
    {
      id: 2,
      recommendation: "Optimize speed",
      ciiBefore: 70,
      ciiAfter: 68,
      costEstimation: "$1500",
    },
    {
      id: 3,
      recommendation: "Reduce emissions",
      ciiBefore: 75,
      ciiAfter: 72,
      costEstimation: "$3000",
    },
    {
      id: 1,
      recommendation: "Improve fuel efficiency",
      ciiBefore: 65,
      ciiAfter: 60,
      costEstimation: "$2000",
    },
    {
      id: 2,
      recommendation: "Optimize speed",
      ciiBefore: 70,
      ciiAfter: 68,
      costEstimation: "$1500",
    },
    {
      id: 3,
      recommendation: "Reduce emissions",
      ciiBefore: 75,
      ciiAfter: 72,
      costEstimation: "$3000",
    },
  ];

  const sortedRecommendations = recommendations.sort((a, b) => {
    return sortBy === "before"
      ? a.ciiBefore - b.ciiBefore
      : a.ciiAfter - b.ciiAfter;
  });

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
            <CiiValueCard ciiData={null} ciiDataRating={null} />
            <Card>
              <CardHeader className="bg-blue-200 text-black p-1 -mt-6 rounded-t-lg">
                <h3 className="text-xl font-semibold text-center">
                  CII Grafik
                </h3>
              </CardHeader>
              <CardContent className="p-4 h-full">
                <div className="flex flex-col items-center justify-center space-y-2 h-full">
                  <LineChart className="text-gray-400" size={40} />
                  <div className="text-sm text-gray-600">
                    Data will appear here
                  </div>
                </div>
                <Button onClick={toggleTableVisibility}>
                  SEEMP Recomendation
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {showTable && (
        <section className="h-90 absolute bottom-0 w-3/5 z-100 left-0 bg-slate-300 p-4">
          <Button onClick={toggleTableVisibility}>Hide Recommendations</Button>
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full table-auto border-collapse bg-white shadow-md rounded-lg">
              <thead>
                <tr className="text-gray-700">
                  <th
                    className="px-6 py-3 border-b text-left cursor-pointer hover:bg-gray-100"
                    onClick={() => setSortBy("before")}
                  >
                    Recommendation
                  </th>
                  <th
                    className="px-6 py-3 border-b text-left cursor-pointer hover:bg-gray-100"
                    onClick={() => setSortBy("before")}
                  >
                    CII Before
                  </th>
                  <th
                    className="px-6 py-3 border-b text-left cursor-pointer hover:bg-gray-100"
                    onClick={() => setSortBy("after")}
                  >
                    CII After
                  </th>
                  <th className="px-6 py-3 border-b text-left">
                    Cost Estimation
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedRecommendations.map((recommendation) => (
                  <tr key={recommendation.id} className="hover:bg-gray-100">
                    <td className="px-6 py-3 border-b">
                      {recommendation.recommendation}
                    </td>
                    <td className="px-6 py-3 border-b">
                      {recommendation.ciiBefore}
                    </td>
                    <td className="px-6 py-3 border-b">
                      {recommendation.ciiAfter}
                    </td>
                    <td className="px-6 py-3 border-b">
                      {recommendation.costEstimation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <PageTitle title="SEEMP Recommendation" />
      <Sidebar />

      <MapComponent markers={shipData} />
    </main>
  );
};

export default SEEMPPage;
