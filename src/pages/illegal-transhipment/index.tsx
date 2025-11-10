import axios from "axios";
import { FC, useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { VITE_BACKEND_URI } from "../../lib/env";
import {
  MarkerData,
  ShipRoute,
} from "../../components/common/map";
import MapComponent from "../../components/common/map";
import IllegalTranshipmentCard, {
  IllegalTranshipmentResult,
} from "./components/illegal-transhipment-card";

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
  const [routes, setRoutes] = useState<ShipRoute[]>([]);
  const [selectedResult, setSelectedResult] =
    useState<IllegalTranshipmentResult | null>(null);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [zoomToRoutes, setZoomToRoutes] = useState(false);
  const location = useLocation();

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
    const interval = setInterval(fetchShipData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchRouteData = useCallback(
    async (result: IllegalTranshipmentResult) => {
      if (!result.startTimestamp || !result.endTimestamp) {
        return;
      }

      setIsLoadingRoutes(true);
      setZoomToRoutes(false);

      try {
        const startTime = new Date(result.startTimestamp).toISOString();
        const endTime = new Date(result.endTimestamp).toISOString();

        const response = await axios.get<RouteApiResponse>(
          `${VITE_BACKEND_URI}/ais/routes/${result.ship1MMSI}/${result.ship2MMSI}`,
          {
            params: {
              startTime,
              endTime,
            },
          }
        );

        if (response.data.success && response.data.data) {
          const { ship1Positions, ship2Positions } = response.data.data;

          const shipRoutes: ShipRoute[] = [];

          if (Array.isArray(ship1Positions) && ship1Positions.length > 0) {
            shipRoutes.push({
              mmsi: result.ship1MMSI,
              positions: ship1Positions.map((pos) => ({
                navstatus: pos.navstatus,
                predictedNavStatus: pos.predictedNavStatus,
                ewsStatus: pos.ewsStatus,
                lat: pos.lat,
                lon: pos.lon,
                sog: pos.sog,
                cog: pos.cog,
                hdg: pos.hdg,
                timestamp: new Date(pos.timestamp),
              })),
              color: "#FF6B6B",
            });
          }

          if (Array.isArray(ship2Positions) && ship2Positions.length > 0) {
            shipRoutes.push({
              mmsi: result.ship2MMSI,
              positions: ship2Positions.map((pos) => ({
                navstatus: pos.navstatus,
                predictedNavStatus: pos.predictedNavStatus,
                ewsStatus: pos.ewsStatus,
                lat: pos.lat,
                lon: pos.lon,
                sog: pos.sog,
                cog: pos.cog,
                hdg: pos.hdg,
                timestamp: new Date(pos.timestamp),
              })),
              color: "#4ECDC4",
            });
          }

          if (shipRoutes.length === 0) {
            setRoutes([]);
            setZoomToRoutes(false);
          } else {
            setRoutes(shipRoutes);
            setZoomToRoutes(true);
          }
        } else {
          setRoutes([]);
          setZoomToRoutes(false);
        }
      } catch (error) {
        console.error("Error fetching route data:", error);
        setRoutes([]);
        setZoomToRoutes(false);
      } finally {
        setIsLoadingRoutes(false);
      }
    },
    []
  );

  const handleSelectResult = useCallback(
    (result: IllegalTranshipmentResult) => {
      setSelectedResult(result);
      fetchRouteData(result);
    },
    [fetchRouteData]
  );

  const clearRoutes = useCallback(() => {
    setRoutes([]);
    setSelectedResult(null);
    setZoomToRoutes(false);
  }, []);

  return (
    <main className="h-screen w-screen relative bg-gray-300 overflow-hidden z-1">
      <aside className="absolute top-0 right-0 z-100 w-[28%] h-full bg-slate-300 p-4 pr-20">
        <IllegalTranshipmentCard
          onSelectResult={handleSelectResult}
          selectedResult={selectedResult}
          onClearRoutes={clearRoutes}
          isLoadingRoutes={isLoadingRoutes}
          routesLoaded={routes.length > 0}
        />
      </aside>

      <MapComponent
        markers={shipData}
        selectedMmsi={selectedMmsi}
        setSelectedMmsi={setSelectedMmsi}
        routes={routes.length > 0 ? routes : undefined}
        zoomToRoutes={zoomToRoutes}
        isBatamView={true}
      />
    </main>
  );
};

export default IllegalTranshipment;