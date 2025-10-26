import axios from "axios";
import { FC, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { VITE_BACKEND_URI } from "../../lib/env";
import { MarkerData, ShipRoute, IllegalTransshipmentArea } from "../../components/common/map";
import MapComponent from "../../components/common/map";

interface RouteApiResponse {
  message: string;
  data: {
    ship1Positions: Array<{
      navstatus: number;
      predictedNavStatus: number;
      ewsStatus: number;
      lat: number;
      lon: number;
      sog: number;
      cog: number;
      hdg: number;
      timestamp: string;
    }>;
    ship2Positions: Array<{
      navstatus: number;
      predictedNavStatus: number;
      ewsStatus: number;
      lat: number;
      lon: number;
      sog: number;
      cog: number;
      hdg: number;
      timestamp: string;
    }>;
  };
  success: boolean;
}

const IllegalTranshipment: FC = () => {
  const [shipData, setShipData] = useState<MarkerData[]>([]);
  const [selectedMmsi, setSelectedMmsi] = useState<string | null>(null);
  const [routes, setRoutes] = useState<ShipRoute[] | null>(null);
  const [illegalAreas, setIllegalAreas] = useState<IllegalTransshipmentArea[] | null>(null);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const location = useLocation();

  const DUMMY_MMSI_1 = "241073000";
  const DUMMY_MMSI_2 = "668116257";
  const DUMMY_START_TIME = "2025-10-23T00:00:00Z";
  const DUMMY_END_TIME = "2026-10-23T14:59:59Z";

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const mmsiParam = urlParams.get("mmsi");
    if (mmsiParam) {
      setSelectedMmsi(mmsiParam);
    }
  }, [location.search]);

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

  const fetchRouteData = async () => {
    setIsLoadingRoutes(true);
    try {
      const response = await axios.get<RouteApiResponse>(
        `${VITE_BACKEND_URI}/ais/routes/${DUMMY_MMSI_1}/${DUMMY_MMSI_2}`,
        {
          params: {
            startTime: DUMMY_START_TIME,
            endTime: DUMMY_END_TIME,
          },
        }
      );

      if (response.data.success && response.data.data) {
        const { ship1Positions, ship2Positions } = response.data.data;

        // Convert API response to ShipRoute format
        const shipRoutes: ShipRoute[] = [];

        if (ship1Positions && ship1Positions.length > 0) {
          shipRoutes.push({
            mmsi: DUMMY_MMSI_1,
            positions: ship1Positions.map(pos => ({
              ...pos,
              timestamp: new Date(pos.timestamp),
            })),
            color: "#FF6B6B", // Red color for ship 1
          });
        }

        if (ship2Positions && ship2Positions.length > 0) {
          shipRoutes.push({
            mmsi: DUMMY_MMSI_2,
            positions: ship2Positions.map(pos => ({
              ...pos,
              timestamp: new Date(pos.timestamp),
            })),
            color: "#4ECDC4", // Teal color for ship 2
          });
        }

        setRoutes(shipRoutes);

        // Set dummy illegal transshipment areas
        // In production, this should come from API response
        const dummyIllegalAreas: IllegalTransshipmentArea[] = [
          {
            latTop: -7.015,
            latBottom: -7.020,
            lonLeft: 112.677,
            lonRight: 112.682,
            confidence: 0.85,
            timestamp: new Date("2025-10-23T10:30:00Z"),
          },
          {
            latTop: -7.012,
            latBottom: -7.016,
            lonLeft: 112.675,
            lonRight: 112.679,
            confidence: 0.72,
            timestamp: new Date("2025-10-23T12:15:00Z"),
          },
        ];

        setIllegalAreas(dummyIllegalAreas);

        console.log("Routes loaded successfully:", shipRoutes);
        alert(`Routes loaded! Ship 1: ${ship1Positions.length} points, Ship 2: ${ship2Positions.length} points`);
      }
    } catch (error) {
      console.error("Error fetching route data:", error);
      alert("Failed to fetch route data. Check console for details.");
    } finally {
      setIsLoadingRoutes(false);
    }
  };

  const clearRoutes = () => {
    setRoutes(null);
    setIllegalAreas(null);
  };

  return (
    <main className="h-screen w-screen relative bg-gray-300 overflow-hidden z-1">
      {/* Control Panel */}
      <aside className="absolute top-4 left-4 z-50 bg-white rounded-lg shadow-lg p-4 max-w-sm">
        <h3 className="text-lg font-bold mb-3 text-gray-800">
          Route Analysis Control
        </h3>
        
        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            <p><span className="font-semibold">Ship 1 MMSI:</span> {DUMMY_MMSI_1}</p>
            <p><span className="font-semibold">Ship 2 MMSI:</span> {DUMMY_MMSI_2}</p>
            <p><span className="font-semibold">Time Range:</span></p>
            <p className="text-xs ml-2">Start: {new Date(DUMMY_START_TIME).toLocaleString()}</p>
            <p className="text-xs ml-2">End: {new Date(DUMMY_END_TIME).toLocaleString()}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchRouteData}
              disabled={isLoadingRoutes}
              className={`flex-1 px-4 py-2 rounded-md font-medium text-white transition-colors ${
                isLoadingRoutes
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
              }`}
            >
              {isLoadingRoutes ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                "Load Routes"
              )}
            </button>

            {routes && (
              <button
                onClick={clearRoutes}
                className="px-4 py-2 rounded-md font-medium text-white bg-red-600 hover:bg-red-700 active:bg-red-800 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {routes && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
              ✓ Routes displayed on map
              <div className="text-xs mt-1">
                • Ship 1 ({DUMMY_MMSI_1}): <span className="text-red-600">●</span> Red
                <br />
                • Ship 2 ({DUMMY_MMSI_2}): <span className="text-teal-600">●</span> Teal
              </div>
            </div>
          )}

          {illegalAreas && illegalAreas.length > 0 && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
              ⚠️ {illegalAreas.length} suspected illegal transshipment area(s) detected
            </div>
          )}
        </div>
      </aside>

      {/* Right Side Panel (commented out for now) */}
      <aside className="absolute top-0 right-0 z-100 w-[28%] h-full bg-slate-300 p-4 pr-20">
        {/* <NavstatusAnomalyCard markers={shipData} /> */}
      </aside>

      <MapComponent
        markers={shipData}
        selectedMmsi={selectedMmsi}
        setSelectedMmsi={setSelectedMmsi}
        routes={routes}
        illegalAreas={illegalAreas}
      />
    </main>
  );
};

export default IllegalTranshipment;