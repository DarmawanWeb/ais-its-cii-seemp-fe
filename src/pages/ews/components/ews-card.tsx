import { FC, useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Card, CardHeader, CardContent } from "../../../components/ui/card";
import { VITE_BACKEND_URI } from "../../../lib/env";
import axios from "axios";

export interface IAisPosition {
  navstatus: number;
  predictedNavStatus: number;
  ewsStatus: number;
  lat: number;
  lon: number;
  sog: number;
  cog: number;
  hdg: number;
  timestamp: Date; 
}

export interface MarkerData {
  mmsi: string;
  icon?: string;
  positions: IAisPosition[];
}

export interface ShipDetails {
  NAME: string;
  MMSI: string;
  IMO?: string;
  FLAGNAME?: string;
  TYPENAME?: string;
}

interface EarlyWarningSystemCardProps {
  markers: MarkerData[];
}

const EarlyWarningSystemCard: FC<EarlyWarningSystemCardProps> = ({ markers }) => {
  const [shipNames, setShipNames] = useState<{ [mmsi: string]: string }>({});
  const [shipTypes, setShipTypes] = useState<{ [mmsi: string]: string }>({});
  const fetchedMMSIs = useRef<Set<string>>(new Set());
  const fetchingMMSIs = useRef<Set<string>>(new Set());

  const getNavStatusDescription = useCallback((status: number): string => {
    const statusMap: { [key: number]: string } = {
      0: "Under Way Using Engine",
      1: "At Anchor",
      2: "Not Under Command",
      3: "Restricted Manoeuvrability", 
      4: "Constrained by Draught",
      5: "Moored",
      6: "Aground",
      7: "Engaged in Fishing",
      8: "Under Way Sailing",
      9: "High Speed Craft",
      10: "Wing in Ground Effect",
      11: "Power-Driven Vessel Towing Astern",
      12: "Power-Driven Vessel Pushing Ahead",
      13: "Reserved for Future Use",
      14: "AIS-SART Active",
      15: "Undefined/Default"
    };
    return statusMap[status] || `Unknown Status (${status})`;
  }, []);

  const formatCoordinates = useCallback((lat: number, lon: number): string => {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`;
  }, []);

  const getRelativeTime = useCallback((timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }, []);

  const fetchShipDetails = useCallback(async (mmsi: string): Promise<ShipDetails | null> => {
    try {
      const response = await axios.get(
        `${VITE_BACKEND_URI}/ships/data/secondary/mmsi/${mmsi}`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch ship details for MMSI ${mmsi}:`, error);
      return null;
    }
  }, []);

  // Get all EWS alerts (warning and critical)
  const allAlerts = useMemo(() => {
    return markers.flatMap((marker) =>
      marker.positions
        .filter((p) => p.ewsStatus === 0 || p.ewsStatus === 1) 
        .map((p) => ({ ...p, mmsi: marker.mmsi }))
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [markers]);

  // Separate warnings and critical alerts
  const warningAlerts = useMemo(() => {
    return allAlerts.filter(alert => alert.ewsStatus === 1);
  }, [allAlerts]);

  const criticalAlerts = useMemo(() => {
    return allAlerts.filter(alert => alert.ewsStatus === 0);
  }, [allAlerts]);

  // Get unique MMSIs from all alerts
  const uniqueMMSIs = useMemo(() => {
    return [...new Set(allAlerts.map(a => a.mmsi))];
  }, [allAlerts]);

  // Fetch ship names only for new MMSIs
  useEffect(() => {
    const fetchNewShipNames = async () => {
      const newMMSIs = uniqueMMSIs.filter(mmsi => 
        !fetchedMMSIs.current.has(mmsi) && 
        !fetchingMMSIs.current.has(mmsi)
      );

      if (newMMSIs.length === 0) return;

      // Add to fetching set to prevent duplicate requests
      newMMSIs.forEach(mmsi => fetchingMMSIs.current.add(mmsi));

      // Fetch all new ship names concurrently
      const fetchPromises = newMMSIs.map(async (mmsi) => {
        try {
          const details = await fetchShipDetails(mmsi);
          
          // Mark as fetched regardless of success
          fetchedMMSIs.current.add(mmsi);
          
          if (details?.NAME) {
            setShipNames(prev => ({
              ...prev,
              [mmsi]: details.NAME
            }));
          }
          if (details?.TYPENAME) {
            setShipTypes(prev => ({
              ...prev,
              [mmsi]: details.TYPENAME
            }));
          }
        } catch (error) {
          console.error(`Error fetching ship ${mmsi}:`, error);
          // Still mark as fetched to prevent retry loops
          fetchedMMSIs.current.add(mmsi);
        } finally {
          // Remove from fetching set
          fetchingMMSIs.current.delete(mmsi);
        }
      });

      await Promise.allSettled(fetchPromises);
    };

    fetchNewShipNames();
  }, [uniqueMMSIs, fetchShipDetails]);

  const renderAlertItem = useCallback((alert: IAisPosition & { mmsi: string }, index: number, isWarning: boolean) => {
    const shipName = shipNames[alert.mmsi];
    const shipType = shipTypes[alert.mmsi];
    const isLoading = fetchingMMSIs.current.has(alert.mmsi);
    
    return (
      <div
        key={`${alert.mmsi}-${alert.timestamp}-${index}`}
        className={`p-3 rounded-lg border-l-4 ${
          isWarning 
            ? "bg-yellow-50 border-l-yellow-500"
            : "bg-red-50 border-l-red-500"
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-semibold text-sm text-gray-800">
              Vessel {alert.mmsi}
            </p>
            {isLoading ? (
              <p className="text-xs text-gray-500 italic">Loading name...</p>
            ) : shipName ? (
              <>
                <p className="text-xs text-gray-600 font-medium">{shipName}</p>
                {shipType && <p className="text-xs text-gray-500 italic">{shipType}</p>}
              </>
            ) : (
              <p className="text-xs text-gray-500">Name not available</p>
            )}
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-500 mb-1">
              {getRelativeTime(alert.timestamp)}
            </span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              isWarning
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}>
              {isWarning ? "Warning" : "Critical Alert"}
            </span>
          </div>
        </div>

        <div className="mb-2 p-2 bg-white rounded border">
          <div className="text-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-red-600 font-medium">AIS Data:</span>
              <span className="text-gray-800">{getNavStatusDescription(alert.navstatus)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-medium">Predicted:</span>
              <span className="text-gray-800">{getNavStatusDescription(alert.predictedNavStatus)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-1 text-xs text-gray-600">
          <div className="flex justify-between">
            <span className="font-medium">Position:</span>
            <span>{formatCoordinates(alert.lat, alert.lon)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Speed:</span>
            <span>{alert.sog.toFixed(1)} knots</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Course:</span>
            <span>{alert.cog.toFixed(0)}°</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Time:</span>
            <span>{new Date(alert.timestamp).toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }, [shipNames, shipTypes, getRelativeTime, getNavStatusDescription, formatCoordinates]);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Warning Alerts Card */}
      <Card className="flex-1 overflow-auto rounded-md border border-yellow-300">
        <CardHeader className="bg-yellow-200 text-black px-3 py-2">
          <h3 className="text-sm font-semibold text-center">⚠️ Warning Alerts</h3>
          <p className="text-xs text-center text-gray-600 mt-1">
            {warningAlerts.length} warning{warningAlerts.length === 1 ? '' : 's'} detected
          </p>
        </CardHeader>
        <CardContent className="px-3 py-2 flex flex-col gap-3 h-full overflow-y-auto">
          {warningAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-4">
              <div className="text-green-500 text-xl mb-2">✓</div>
              <p className="text-sm font-medium text-gray-700 mb-1">No Warnings</p>
              <p className="text-xs text-gray-500">
                All systems operating within normal parameters.
              </p>
            </div>
          ) : (
            warningAlerts.map((alert, index) => renderAlertItem(alert, index, true))
          )}
        </CardContent>
      </Card>

      {/* Critical Alerts Card */}
      <Card className="flex-1 overflow-auto rounded-md border border-red-300">
        <CardHeader className="bg-red-200 text-black px-3 py-2">
          <h3 className="text-sm font-semibold text-center">🚨 Critical Alerts</h3>
          <p className="text-xs text-center text-gray-600 mt-1">
            {criticalAlerts.length} critical alert{criticalAlerts.length === 1 ? '' : 's'} detected
          </p>
        </CardHeader>
        <CardContent className="px-3 py-2 flex flex-col gap-3 h-full overflow-y-auto">
          {criticalAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-4">
              <div className="text-green-500 text-xl mb-2">✓</div>
              <p className="text-sm font-medium text-gray-700 mb-1">No Critical Alerts</p>
              <p className="text-xs text-gray-500">
                No immediate threats detected.
              </p>
            </div>
          ) : (
            criticalAlerts.map((alert, index) => renderAlertItem(alert, index, false))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EarlyWarningSystemCard;