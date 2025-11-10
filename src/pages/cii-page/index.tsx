import { FC, useState, useEffect, useRef, useCallback } from "react";
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
  const [isSearchActive, setIsSearchActive] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const aisDataIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const ciiDataIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const ciiGrafikIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const shipDetailIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = useCallback((query: string, ships: MarkerData[]) => {
    if (query.trim() === "") {
      return [];
    }

    const searchTerm = query.trim();
    const filtered = ships.filter((ship) => {
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

    return filtered;
  }, []);

  // Update filtered ships when ship data changes, but only if searching
  useEffect(() => {
    if (isSearchActive && searchQuery.trim() !== "") {
      const filtered = performSearch(searchQuery, shipData);
      setFilteredShips(filtered);
    } else if (!isSearchActive) {
      setFilteredShips([]);
    }
  }, [shipData, isSearchActive, searchQuery, performSearch]);

  // Handle URL params for selected MMSI
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const mmsiParam = urlParams.get("mmsi");
    if (mmsiParam) {
      setSelectedMmsi(mmsiParam);
    }
  }, [location.search]);

  // Fetch functions with error handling
  const fetchShipData = useCallback(async () => {
   try {
        const response = await axios.get(`${VITE_BACKEND_URI}/ais`);
        const allData = response.data.data;
        
        let i = 0;
        const chunkSize = 5; 

        const interval = setInterval(() => {
          setShipData((prev) => [
            ...prev,
            ...allData.slice(i, i + chunkSize)
          ]);
          i += chunkSize;
          if (i >= allData.length) clearInterval(interval);
        }, 100);
      } catch (error) {
        console.error("Error fetching ship data:", error);
      }
  }, []);


  const fetchShipDetail = useCallback(async (mmsi: string) => {
    try {
      const response = await axios.get(
        `${VITE_BACKEND_URI}/ships/data/secondary/mmsi/${mmsi}`
      );
      setShipDetailData(response.data.data);
    } catch (error) {
      console.error("Error fetching ship detail:", error);
    }
  }, []);

  const fetchCiiData = useCallback(async (mmsi: string) => {
    try {
      const response = await axios.get(
        `${VITE_BACKEND_URI}/cii/daily/${mmsi}/latest`
      );
      setCiiData(response.data.data.cii[0].cii);
    } catch (error) {
      console.error("Error fetching CII data:", error);
    }
  }, []);

  const fetchCiiGrafik = useCallback(async (mmsi: string) => {
    try {
      const response = await axios.get(
        `${VITE_BACKEND_URI}/cii/daily/${mmsi}/attained`
      );
      setCiiGrafik(response.data.data);
    } catch (error) {
      console.error("Error fetching CII grafik:", error);
    }
  }, []);

  // Setup AIS data fetching (real-time untuk peta)
  useEffect(() => {
    fetchShipData();
    
    aisDataIntervalRef.current = setInterval(fetchShipData, 100);

    return () => {
      if (aisDataIntervalRef.current) {
        clearInterval(aisDataIntervalRef.current);
      }
    };
  }, [fetchShipData]);

  useEffect(() => {
    if (shipDetailIntervalRef.current) {
      clearInterval(shipDetailIntervalRef.current);
    }

    if (selectedMmsi) {
      fetchShipDetail(selectedMmsi);
      
      shipDetailIntervalRef.current = setInterval(() => {
        fetchShipDetail(selectedMmsi);
      }, 5000);
    } else {
      setShipDetailData(null);
    }

    return () => {
      if (shipDetailIntervalRef.current) {
        clearInterval(shipDetailIntervalRef.current);
      }
    };
  }, [selectedMmsi, fetchShipDetail]);

  useEffect(() => {
    if (ciiDataIntervalRef.current) {
      clearInterval(ciiDataIntervalRef.current);
    }

    if (selectedMmsi) {
      setShowCiiSection(false);
      
      fetchCiiData(selectedMmsi);
      
      ciiDataIntervalRef.current = setInterval(() => {
        fetchCiiData(selectedMmsi);
      }, 1000);
    } else {
      setCiiData(null);
    }

    return () => {
      if (ciiDataIntervalRef.current) {
        clearInterval(ciiDataIntervalRef.current);
      }
    };
  }, [selectedMmsi, fetchCiiData]);

  useEffect(() => {
    if (ciiGrafikIntervalRef.current) {
      clearInterval(ciiGrafikIntervalRef.current);
    }

    if (selectedMmsi) {
      fetchCiiGrafik(selectedMmsi);
      
      ciiGrafikIntervalRef.current = setInterval(() => {
        fetchCiiGrafik(selectedMmsi);
      }, 2000);
    } else {
      setCiiGrafik(null);
    }

    return () => {
      if (ciiGrafikIntervalRef.current) {
        clearInterval(ciiGrafikIntervalRef.current);
      }
    };
  }, [selectedMmsi, fetchCiiGrafik]);

  useEffect(() => {
    return () => {
      if (aisDataIntervalRef.current) {
        clearInterval(aisDataIntervalRef.current);
      }
      if (ciiDataIntervalRef.current) {
        clearInterval(ciiDataIntervalRef.current);
      }
      if (ciiGrafikIntervalRef.current) {
        clearInterval(ciiGrafikIntervalRef.current);
      }
      if (shipDetailIntervalRef.current) {
        clearInterval(shipDetailIntervalRef.current);
      }
    };
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearchActive(query.trim() !== "");
    
    if (query.trim() === "") {
      setFilteredShips([]);
    } else {
      const filtered = performSearch(query, shipData);
      setFilteredShips(filtered);
    }
  };

  const handleShipClick = (mmsi: string) => {
    navigate(`?mmsi=${mmsi}`);
    setSearchQuery("");
    setFilteredShips([]);
    setIsSearchActive(false);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setFilteredShips([]);
      setIsSearchActive(false);
    }, 200);
  };

  const handleInputFocus = () => {
    if (searchQuery.trim()) {
      setIsSearchActive(true);
      handleSearch(searchQuery);
    }
  };

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
            onFocus={handleInputFocus}
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