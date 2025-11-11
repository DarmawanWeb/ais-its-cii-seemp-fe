import axios from "axios";
import { FC, useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { VITE_BACKEND_URI } from "../../lib/env";
import { MarkerData, ShipRoute, IAisPosition } from "../../components/common/map";
import MapComponent from "../../components/common/map";
import IllegalTranshipmentCard, { IllegalTranshipmentResult } from "./components/illegal-transhipment-card";

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
  const [selectedResult, setSelectedResult] = useState<IllegalTranshipmentResult | null>(null);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [zoomToRoutes, setZoomToRoutes] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const mmsiParam = urlParams.get("mmsi");
    if (mmsiParam) setSelectedMmsi(mmsiParam);
  }, [location.search]);

  useEffect(() => {
    const fetchShipData = async () => {
      try {
        const response = await axios.get(`${VITE_BACKEND_URI}/ais`, {
          params: { hours: 12 },
        });
        const allData = response.data.data;
        let i = 0;
        const chunkSize = 10;
        const interval = setInterval(() => {
          setShipData((prev) => [...prev, ...allData.slice(i, i + chunkSize)]);
          i += chunkSize;
          if (i >= allData.length) clearInterval(interval);
        }, 80);
      } catch (error) {
        console.error("Error fetching ship data:", error);
      }
    };
    fetchShipData();
    const interval = setInterval(fetchShipData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchRouteData = useCallback(async (result: IllegalTranshipmentResult) => {
    if (!result.startTimestamp || !result.endTimestamp) {
      console.warn("Missing timestamp data in result");
      return;
    }
    
    setIsLoadingRoutes(true);
    setZoomToRoutes(false);
    
    try {
      const startTime = new Date(result.startTimestamp);
      const endTime = new Date(result.endTimestamp);
      
      // Validate timestamps
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        console.error("Invalid timestamp format");
        setRoutes([]);
        setIsLoadingRoutes(false);
        return;
      }
      
      const sixHoursMs = 6 * 60 * 60 * 1000;
      const adjustedStart = new Date(startTime.getTime() - sixHoursMs);
      const adjustedEnd = new Date(Math.min(endTime.getTime() + sixHoursMs, Date.now()));
      
      console.log("Fetching routes:", {
        ship1: result.ship1MMSI,
        ship2: result.ship2MMSI,
        startTime: adjustedStart.toISOString(),
        endTime: adjustedEnd.toISOString(),
      });

      const response = await axios.get<RouteApiResponse>(
        `${VITE_BACKEND_URI}/ais/routes/${result.ship1MMSI}/${result.ship2MMSI}`,
        { 
          params: { 
            startTime: adjustedStart.toISOString(), 
            endTime: adjustedEnd.toISOString() 
          } 
        }
      );

      if (response.data.success && response.data.data) {
        const { ship1Positions, ship2Positions } = response.data.data;
        const shipRoutes: ShipRoute[] = [];

        // Process ship 1 route
        if (Array.isArray(ship1Positions) && ship1Positions.length > 0) {
          const positions: IAisPosition[] = ship1Positions.map((p) => ({
            navstatus: p.navstatus,
            predictedNavStatus: p.predictedNavStatus,
            ewsStatus: p.ewsStatus,
            lat: p.lat,
            lon: p.lon,
            sog: p.sog,
            cog: p.cog,
            hdg: p.hdg,
            timestamp: new Date(p.timestamp),
          }));

          shipRoutes.push({
            mmsi: result.ship1MMSI,
            positions,
            color: "#FF6B6B",
            illegalSegment: {
              start: new Date(result.startTimestamp),
              end: new Date(result.endTimestamp),
              color: "#FFD93D",
            },
          });

          console.log(`Ship 1 route added: ${positions.length} positions`);
        }

        // Process ship 2 route
        if (Array.isArray(ship2Positions) && ship2Positions.length > 0) {
          const positions: IAisPosition[] = ship2Positions.map((p) => ({
            navstatus: p.navstatus,
            predictedNavStatus: p.predictedNavStatus,
            ewsStatus: p.ewsStatus,
            lat: p.lat,
            lon: p.lon,
            sog: p.sog,
            cog: p.cog,
            hdg: p.hdg,
            timestamp: new Date(p.timestamp),
          }));

          shipRoutes.push({
            mmsi: result.ship2MMSI,
            positions,
            color: "#4ECDC4",
            illegalSegment: {
              start: new Date(result.startTimestamp),
              end: new Date(result.endTimestamp),
              color: "#FFD93D",
            },
          });

          console.log(`Ship 2 route added: ${positions.length} positions`);
        }

        if (shipRoutes.length === 0) {
          console.warn("No route data available for either ship");
          setRoutes([]);
          setZoomToRoutes(false);
        } else {
          console.log(`Total routes loaded: ${shipRoutes.length}`);
          setRoutes(shipRoutes);
          setZoomToRoutes(true);
        }
      } else {
        console.warn("API response unsuccessful or no data");
        setRoutes([]);
        setZoomToRoutes(false);
      }
    } catch (error) {
      console.error("Error fetching route data:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response data:", error.response?.data);
        console.error("Response status:", error.response?.status);
      }
      setRoutes([]);
      setZoomToRoutes(false);
    } finally {
      setIsLoadingRoutes(false);
    }
  }, []);

  const handleSelectResult = useCallback((result: IllegalTranshipmentResult) => {
    console.log("Selected result:", result);
    setSelectedResult(result);
    fetchRouteData(result);
  }, [fetchRouteData]);

  const clearRoutes = useCallback(() => {
    setRoutes([]);
    setSelectedResult(null);
    setZoomToRoutes(false);
    console.log("Routes cleared");
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