import axios from "axios";
import { FC, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { Search } from "lucide-react";
import ShipInfoCard from "./components/ship-info-card";
import { VITE_BACKEND_URI } from "../../lib/env";
import { MarkerData } from "../../components/common/map";
import MapComponent from "../../components/common/map";
import TelemetryChart from "./components/telemetry-chart";
import { IFuelConsumption } from "./components/telemetry-chart";

import { ShipData } from "./components/ship-info-card";

interface FuelLogEntry {
  fuelME: {
    $numberDecimal: string;
  };
  fuelAE: {
    $numberDecimal: string;
  };
  timestamp: string;
}

interface FuelDataResponse {
  _id: string;
  mmsi: string;
  fuelLogs: FuelLogEntry[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiFuelResponse {
  data: FuelDataResponse[];
}

const TelemetryPage: FC = () => {
  const [shipData, setShipData] = useState<MarkerData[]>([]);
  const [shipDetail, setShipDetail] = useState<ShipData | null>(null);
  const [fuelData, setFuelData] = useState<IFuelConsumption[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredShips, setFilteredShips] = useState<MarkerData[]>([]);
  const [selectedMmsi, setSelectedMmsi] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

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
    if (!selectedMmsi) return setShipDetail(null);
    const fetchDetails = async () => {
      try {
        const { data } = await axios.get(
          `${VITE_BACKEND_URI}/ships/data/secondary/mmsi/${selectedMmsi}`
        );
        setShipDetail(data.data);
      } catch (error) {
        console.error("Error fetching ship detail:", error);
      }
    };
    fetchDetails();
  }, [selectedMmsi]);

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
    };

    fetchShipData();
  }, []);

  useEffect(() => {
    const fetchFuelData = async () => {
      if (!selectedMmsi) {
        setFuelData([]);
        return;
      }
      
      try {
        const response = await axios.get<ApiFuelResponse>(
          `${VITE_BACKEND_URI}/ships/fuel-data`
        );
        
        const shipFuelData = response.data.data.filter(
          (ship) => ship.mmsi === selectedMmsi
        );
        
        if (shipFuelData.length === 0) {
          setFuelData([]);
          return;
        }
        
        const allFuelLogs: IFuelConsumption[] = [];
        
        shipFuelData.forEach((ship) => {
          ship.fuelLogs.forEach((log) => {
            allFuelLogs.push({
              timestamp: log.timestamp,
              fuelME: parseFloat(log.fuelME.$numberDecimal),
              fuelAE: parseFloat(log.fuelAE.$numberDecimal),
            });
          });
        });
        
        allFuelLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        
        setFuelData(allFuelLogs);
      } catch (error) {
        setFuelData([]);
        console.error("Error fetching fuel data:", error);
      }
    };
    
    if (!selectedMmsi) {
      setFuelData([]);
      return;
    }

    fetchFuelData();
    const interval = setInterval(fetchFuelData, 500);

    return () => clearInterval(interval);
  }, [selectedMmsi]);

  return (
    <main className="h-screen w-screen relative bg-gray-300 overflow-hidden z-1">
      <aside className="absolute top-0 right-0 z-100 w-7/20 h-full bg-slate-300 p-3 rounded-l-xl">
        <div className="mb-2 mr-16 relative mt-2">
          <Input
            placeholder="Search ships by MMSI..."
            className="w-full p-1 rounded-md border border-gray-400 bg-white pl-8 text-xs"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onBlur={handleInputBlur}
            onFocus={() => {
              if (searchQuery.trim()) {
                handleSearch(searchQuery);
              }
            }}
          />
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
            <Search className="text-gray-600" size={16} />
          </div>
          {searchQuery.trim() && filteredShips.length > 0 && (
            <div className="mt-2 bg-white border rounded-md shadow-lg text-sm max-h-40 overflow-y-auto absolute z-999 w-full">
              {filteredShips.map((ship) => (
                <div
                  key={ship.mmsi}
                  className="block px-3 py-1 hover:bg-gray-200 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleShipClick(ship.mmsi)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <div className="font-medium">{ship.mmsi}</div>
  
                </div>
              ))}
            </div>
          )}
          {searchQuery.trim() && filteredShips.length === 0 && (
            <div className="mt-2 bg-white border rounded-md shadow-lg text-sm p-3 absolute z-999 w-full">
              <div className="text-gray-500">No ships found matching "{searchQuery}"</div>
            </div>
          )}
        </div>

        <div className="grid grid-rows-9 gap-4 mb-4 mr-16 h-[90vh]">
          <ShipInfoCard shipData={shipDetail} />
          <TelemetryChart fuel={fuelData} />
        </div>
      </aside>

      <MapComponent
        markers={shipData}
        selectedMmsi={selectedMmsi}
        setSelectedMmsi={setSelectedMmsi}
      />
    </main>
  );
};

export default TelemetryPage;