import { FC, useState, useEffect } from "react";
import MapComponent from "../../components/common/map";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "../../components/ui/input";
import CIISection from "./components/cii-section";
import { Search } from "lucide-react";
import ShipInfoCard from "./components/ship-info-card";
import axios from "axios";
import { VITE_BACKEND_URI } from "../../lib/env";
import { MarkerData } from "../../components/common/map";
import { ShipData } from "./components/ship-info-card";
import { ICIICalculation } from "./cii-value-card";

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
  const [ciiData, setCiiData] = useState<ICIICalculation | null>(null);
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
    const fetchShipDetail = async (mmsi: string) => {
      try {
        const response = await axios.get(
          `${VITE_BACKEND_URI}/ships/data/secondary/mmsi/${mmsi}`
        );
        setShipDetailData(response.data.data);
      } catch (error) {
        console.error("Error fetching ship detail:", error);
      }
    };
    if (selectedMmsi) {
      fetchShipDetail(selectedMmsi);
    } else {
      setShipDetailData(null);
    }
  }, [selectedMmsi]);

  useEffect(() => {
    if (selectedMmsi) {
      const fetchCiiData = async (mmsi: string) => {
        try {
          const response = await axios.get(
            `${VITE_BACKEND_URI}/cii/daily/${mmsi}/latest`
          );
          setCiiData(response.data.data.cii[0].cii);
        } catch (error) {
          console.error("Error fetching CII data:", error);
        }
      };
      setShowCiiSection(false);
      fetchCiiData(selectedMmsi);
    }
  }, [selectedMmsi]);

  useEffect(() => {
    if (selectedMmsi) {
      const fetchCiiGrafik = async (mmsi: string) => {
        try {
          const response = await axios.get(
            `${VITE_BACKEND_URI}/cii/daily/${mmsi}/attained`
          );
          console.log("CII Grafik Data:", response.data.data);
          setCiiGrafik(response.data.data);
        } catch (error) {
          console.error("Error fetching CII grafik:", error);
        }
      };
      fetchCiiGrafik(selectedMmsi);
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

  const toggleCiiSection = () => {
    setShowCiiSection(!showCiiSection);
  };

  return (
    <main className="h-screen w-screen relative bg-gray-300 overflow-hidden z-0">
      <aside className="absolute top-0 right-0 z-100 w-[28%] h-full bg-slate-300 p-4">
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
        <div className="mr-16 h-[90vh] ">
          <ShipInfoCard
            shipData={shipDetailData}
            toogleCiiSection={toggleCiiSection}
            showCiiSection={showCiiSection}
          />
        </div>
      </aside>
      <CIISection
        ciiGrafik={ciiGrafik}
        ciiData={ciiData}
        show={showCiiSection}
      />

      <MapComponent
        markers={shipData}
        selectedMmsi={selectedMmsi}
        setSelectedMmsi={setSelectedMmsi}
      />
    </main>
  );
};

export default CIIPage;
