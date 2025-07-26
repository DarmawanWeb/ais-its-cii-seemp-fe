import { FC, useState, useEffect, useRef } from "react";
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
  const [filteredShips, setFilteredShips] = useState<MarkerData[]>([]);
  const [selectedMmsi, setSelectedMmsi] = useState<string | null>(null);
  const [showCiiSection, setShowCiiSection] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Refs untuk interval management
  const ciiDataIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const ciiGrafikIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setFilteredShips(shipData);
  }, [shipData]);

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

  const fetchCiiGrafik = async (mmsi: string) => {
    try {
      const response = await axios.get(
        `${VITE_BACKEND_URI}/cii/daily/${mmsi}/attained`
      );
      setCiiGrafik(response.data.data);
    } catch (error) {
      console.error("Error fetching CII grafik:", error);
    }
  };

  useEffect(() => {
    if (ciiDataIntervalRef.current) {
      clearInterval(ciiDataIntervalRef.current);
    }

    if (selectedMmsi) {
      setShowCiiSection(false);
      
      // Fetch pertama kali
      fetchCiiData(selectedMmsi);
      
      // Set interval untuk fetch setiap 1 detik
      ciiDataIntervalRef.current = setInterval(() => {
        fetchCiiData(selectedMmsi);
      }, 1000);
    }

    // Cleanup function
    return () => {
      if (ciiDataIntervalRef.current) {
        clearInterval(ciiDataIntervalRef.current);
      }
    };
  }, [selectedMmsi]);

  // Effect untuk CII grafik data dengan auto-refresh setiap 1 detik
  useEffect(() => {
    // Clear existing interval
    if (ciiGrafikIntervalRef.current) {
      clearInterval(ciiGrafikIntervalRef.current);
    }

    if (selectedMmsi) {
      // Fetch pertama kali
      fetchCiiGrafik(selectedMmsi);
      
      // Set interval untuk fetch setiap 1 detik
      ciiGrafikIntervalRef.current = setInterval(() => {
        fetchCiiGrafik(selectedMmsi);
      }, 1000);
    }

    // Cleanup function
    return () => {
      if (ciiGrafikIntervalRef.current) {
        clearInterval(ciiGrafikIntervalRef.current);
      }
    };
  }, [selectedMmsi]);

  // Cleanup intervals saat component unmount
  useEffect(() => {
    return () => {
      if (ciiDataIntervalRef.current) {
        clearInterval(ciiDataIntervalRef.current);
      }
      if (ciiGrafikIntervalRef.current) {
        clearInterval(ciiGrafikIntervalRef.current);
      }
    };
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredShips([]);
    } else {
      const searchTerm = query.trim();
      const filtered = shipData.filter((ship) => {
        if (ship.mmsi === searchTerm) {
          return true;
        }
        return ship.mmsi.startsWith(searchTerm);
      });
      
      filtered.sort((a, b) => {
        if (a.mmsi === searchTerm) return -1;
        if (b.mmsi === searchTerm) return 1;
        return a.mmsi.localeCompare(b.mmsi);
      });
      
      setFilteredShips(filtered);
    }
  };

  const handleShipClick = (mmsi: string) => {
    navigate(`?mmsi=${mmsi}`);
    setSearchQuery("");
    setFilteredShips([]);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setFilteredShips([]);
    }, 200);
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

    const interval = setInterval(fetchShipData, 100);

    return () => clearInterval(interval);
  }, []);

  const toggleCiiSection = () => {
    setShowCiiSection(!showCiiSection);
  };

  return (
    <main className="h-screen w-screen relative bg-gray-300 overflow-hidden z-0">
      <aside className="absolute top-0 right-0 z-100 w-[28%] h-full bg-slate-300 p-4">
        <div className="mb-4 mr-16 relative">
          <Input
            placeholder="Search ships by MMSI..."
            className="w-full p-3 rounded-lg border border-gray-400 bg-white pl-10"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onBlur={handleInputBlur}
            onFocus={() => {
              if (searchQuery.trim()) {
                handleSearch(searchQuery);
              }
            }}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Search className="text-gray-600" size={20} />
          </div>
          {searchQuery.trim() && filteredShips.length > 0 && (
            <div className="mt-2 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto absolute z-999 w-full">
              {filteredShips.map((ship) => (
                <div
                  key={ship.mmsi}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleShipClick(ship.mmsi)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <div className="font-medium">{ship.mmsi}</div>
                </div>
              ))}
            </div>
          )}
          {searchQuery.trim() && filteredShips.length === 0 && (
            <div className="mt-2 bg-white border rounded-lg shadow-lg text-sm p-3 absolute z-999 w-full">
              <div className="text-gray-500">No ships found matching "{searchQuery}"</div>
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