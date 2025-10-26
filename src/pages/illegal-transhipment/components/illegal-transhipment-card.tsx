import { FC, useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardContent } from "../../../components/ui/card";
import { VITE_BACKEND_URI } from "../../../lib/env";
import axios from "axios";

export interface IllegalTranshipmentResult {
  _id: string;
  ship1MMSI: string;
  ship2MMSI: string;
  isIllegal: boolean;
  startTimestamp?: Date;
  endTimestamp?: Date;
  accuracy?: number;
  averagePriority?: number;
  priorityDistribution?: {
    low: number;
    medium: number;
    high: number;
  };
  detectedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShipDetails {
  NAME: string;
  MMSI: string;
  IMO?: string;
  FLAGNAME?: string;
  TYPENAME?: string;
}

interface IllegalTranshipmentCardProps {
  onSelectResult: (result: IllegalTranshipmentResult) => void;
  selectedResult: IllegalTranshipmentResult | null;
  onClearRoutes: () => void;
  isLoadingRoutes: boolean;
  routesLoaded: boolean;
}

const IllegalTranshipmentCard: FC<IllegalTranshipmentCardProps> = ({
  onSelectResult,
  selectedResult,
  onClearRoutes,
  isLoadingRoutes,
  routesLoaded,
}) => {
  const [results, setResults] = useState<IllegalTranshipmentResult[]>([]);
  const [shipNames, setShipNames] = useState<{ [mmsi: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);

  const getRelativeTime = useCallback((timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Now";
  }, []);

  const fetchShipDetails = useCallback(
    async (mmsi: string): Promise<ShipDetails | null> => {
      try {
        const response = await axios.get(
          `${VITE_BACKEND_URI}/ships/data/secondary/mmsi/${mmsi}`
        );
        return response.data.data;
      } catch (error) {
          console.error(`Error fetching ship details for MMSI ${mmsi}:`, error);
        return null;
      }
    },
    []
  );

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${VITE_BACKEND_URI}/illegal-transhipment/results`
        );
        if (response.data.success) {
          setResults(response.data.data);

          const uniqueMMSIs = new Set<string>();
          response.data.data.forEach((result: IllegalTranshipmentResult) => {
            uniqueMMSIs.add(result.ship1MMSI);
            uniqueMMSIs.add(result.ship2MMSI);
          });

          const mmsiArray = Array.from(uniqueMMSIs);
          const namePromises = mmsiArray.map(async (mmsi) => {
            const details = await fetchShipDetails(mmsi);
            return { mmsi, name: details?.NAME || null };
          });

          const names = await Promise.all(namePromises);
          const namesMap: { [mmsi: string]: string } = {};
          names.forEach(({ mmsi, name }) => {
            if (name) namesMap[mmsi] = name;
          });
          setShipNames(namesMap);
        }
      } catch (error) {
        console.error("Error fetching illegal transhipment results:", error);
        
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
    const interval = setInterval(fetchResults, 30000);
    return () => clearInterval(interval);
  }, [fetchShipDetails]);

  const getAccuracyColor = useCallback((accuracy: number): string => {
    if (accuracy >= 90) return "text-red-700";
    if (accuracy >= 80) return "text-orange-600";
    if (accuracy >= 70) return "text-yellow-700";
    return "text-gray-700";
  }, []);

  const getAccuracyBgColor = useCallback((accuracy: number): string => {
    if (accuracy >= 90) return "bg-red-100";
    if (accuracy >= 80) return "bg-orange-100";
    if (accuracy >= 70) return "bg-yellow-100";
    return "bg-gray-100";
  }, []);

  const renderResultItem = useCallback(
    (result: IllegalTranshipmentResult) => {
      const ship1Name = shipNames[result.ship1MMSI];
      const ship2Name = shipNames[result.ship2MMSI];
      const isSelected = selectedResult?._id === result._id;

      return (
        <div
          key={result._id}
          onClick={() => onSelectResult(result)}
          className={`rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
            isSelected
              ? "bg-blue-50 border-blue-500 shadow-md"
              : "bg-white border-red-300 hover:border-red-400"
          }`}
        >
          <div className={`p-3 rounded-t-lg ${isSelected ? 'bg-blue-100' : 'bg-red-50'}`}>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-red-600 font-bold text-lg">⚠️</span>
                <p className="font-bold text-sm text-gray-900">Detection Alert</p>
              </div>
              <p className="text-xs text-gray-600">{getRelativeTime(result.detectedAt)}</p>
            </div>

            <div className="space-y-2 bg-white rounded-lg p-2 border border-gray-200">
              <div>
                <p className="text-xs text-gray-600 font-medium">Ship 1:</p>
                <p className="text-sm font-semibold text-gray-900">{result.ship1MMSI}</p>
                {ship1Name && <p className="text-xs text-gray-600">{ship1Name}</p>}
              </div>
              <div className="border-t pt-2">
                <p className="text-xs text-gray-600 font-medium">Ship 2:</p>
                <p className="text-sm font-semibold text-gray-900">{result.ship2MMSI}</p>
                {ship2Name && <p className="text-xs text-gray-600">{ship2Name}</p>}
              </div>
            </div>
          </div>

          <div className="p-3 space-y-2">
            <div className={`rounded-lg p-3 text-center ${getAccuracyBgColor(result.accuracy || 0)}`}>
              <p className="text-xs text-gray-700 font-medium mb-1">Detection Accuracy</p>
              <p className={`text-3xl font-bold ${getAccuracyColor(result.accuracy || 0)}`}>
                {result.accuracy?.toFixed(1)}%
              </p>
            </div>

            {result.startTimestamp && result.endTimestamp && (
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <p className="text-xs text-gray-700 font-medium mb-1">Detection Period</p>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Start:</span>{" "}
                    {new Date(result.startTimestamp).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">End:</span>{" "}
                    {new Date(result.endTimestamp).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            )}

            {isSelected && (
              <div className="mt-2 p-2 bg-blue-100 rounded-lg border border-blue-300">
                <p className="text-xs text-blue-800 font-semibold text-center">
                  📍 Routes displayed on map
                </p>
              </div>
            )}
          </div>
        </div>
      );
    },
    [shipNames, selectedResult, getRelativeTime, onSelectResult, getAccuracyColor, getAccuracyBgColor]
  );

  return (
    <div className="h-full flex flex-col gap-3">
      <Card className="flex-1 overflow-hidden rounded-lg border-2 border-red-400 flex flex-col shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-base font-bold">Illegal Transhipment Detection</h3>
          </div>
          <p className="text-sm text-center text-red-100 mt-1">
            {results.length} case{results.length === 1 ? "" : "s"} detected
          </p>
        </CardHeader>
        <CardContent className="px-4 py-3 flex-1 overflow-y-auto bg-gray-50">
          <div className="flex flex-col gap-3">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center text-center h-[70vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-red-600 mb-3"></div>
                <p className="text-sm font-medium text-gray-700">Loading detections...</p>
              </div>
            ) : results.length === 0 ? (           
            <div className="flex flex-col items-center justify-center text-center py-8  h-[70vh]">
                <div className="text-green-500 text-2xl mb-2">✓</div>
                   <p className="text-base font-bold text-gray-800 mb-2">
                  No Illegal Activity Detected
                </p>
                <p className="text-sm text-gray-600">
                  All vessel movements appear normal
                </p>
          </div>
            ) : (
              results.map((result) => renderResultItem(result))
            )}
          </div>
        </CardContent>
      </Card>

      {selectedResult && (
        <Card className="flex-shrink-0 rounded-lg border-2 border-blue-400 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2">
            <h4 className="text-sm font-bold text-center">Route Controls</h4>
          </CardHeader>
          <CardContent className="p-3">
            {isLoadingRoutes ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-3 border-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">Loading routes...</span>
              </div>
            ) : routesLoaded ? (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border-2 border-green-300 rounded-lg">
                  <p className="text-sm text-green-800 font-bold mb-2 flex items-center gap-2">
                    <span className="text-lg">✓</span>
                    Routes Displayed
                  </p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 bg-white p-2 rounded">
                      <span className="text-red-600 text-xl font-bold">●</span>
                      <div>
                        <p className="font-semibold text-gray-900">Ship 1</p>
                        <p className="text-gray-600">{selectedResult.ship1MMSI}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white p-2 rounded">
                      <span className="text-teal-600 text-xl font-bold">●</span>
                      <div>
                        <p className="font-semibold text-gray-900">Ship 2</p>
                        <p className="text-gray-600">{selectedResult.ship2MMSI}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClearRoutes}
                  className="w-full px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 transition-all shadow-md hover:shadow-lg"
                >
                  Clear Routes
                </button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IllegalTranshipmentCard;