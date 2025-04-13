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
    console.log("MMSI Param:", mmsiParam);
    if (mmsiParam) {
      setSelectedMmsi(mmsiParam);
    }
  }, [location.search]);

  console.log("Selected MMSI:", selectedMmsi);

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
      <section className="absolute top-0 right-0 z-100 w-[27%] h-full bg-slate-300 p-4">
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
        <div className=" mr-20 h-[89vh]">
          <ShipInfoCard shipData={shipDetailData} />
        </div>
      </section>
      <PageTitle title="CII Calculation" />
      <Sidebar />

      <MapComponent markers={shipData} />
    </main>
  );
};

export default CIIPage;
