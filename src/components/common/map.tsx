import { FC, useEffect, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  LayersControl,
  useMapEvents,
  ZoomControl,
  CircleMarker,
  Popup,
  Polyline,
  Polygon,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import useTileStore from "../../hooks/use-selected-tile";
import { MarkerPopup } from "./marker-popup";
import { STADIA_MAPS_API_KEY } from "../../lib/env";
import restrictedZoneData from "../../data/pipe.json";

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

export interface IllegalTransshipmentArea {
  latTop: number;
  latBottom: number;
  lonLeft: number;
  lonRight: number;
  confidence?: number;
  timestamp?: Date;
}

export interface ShipRoute {
  mmsi: string;
  positions: IAisPosition[];
  color?: string;
}

interface ZoomToRoutesProps {
  routes: ShipRoute[] | null | undefined;
  shouldZoom: boolean;
}

export interface MapComponentProps {
  markers: MarkerData[] | null;
  selectedMmsi: string | null;
  setSelectedMmsi: (mmsi: string | null) => void;
  routes?: ShipRoute[] | null;
  illegalAreas?: IllegalTransshipmentArea[] | null;
  zoomToRoutes?: boolean;
}

// Data points from the provided JSON

// Sort data by KP number for proper line connection
const sortedData = restrictedZoneData.sort((a, b) => {
  const aKp = parseFloat(a.Name.replace("KP ", ""));
  const bKp = parseFloat(b.Name.replace("KP ", ""));
  return aKp - bKp;
});

// Convert to polyline coordinates
const polylineCoordinates: [number, number][] = sortedData.map(point => [
  point.Latitude,
  point.Longitude
]);

// Function to calculate perpendicular offset from a point
const calculateOffset = (
  lat: number,
  lon: number,
  bearing: number,
  distanceMeters: number
): [number, number] => {
  const earthRadius = 6378137;
  const angularDistance = distanceMeters / earthRadius;
  const latRad = lat * Math.PI / 180;
  const lonRad = lon * Math.PI / 180;
  
  const newLatRad = Math.asin(
    Math.sin(latRad) * Math.cos(angularDistance) +
    Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(bearing)
  );
  
  const newLonRad = lonRad + Math.atan2(
    Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latRad),
    Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(newLatRad)
  );
  
  return [newLatRad * 180 / Math.PI, newLonRad * 180 / Math.PI];
};

const ZoomToRoutes: FC<ZoomToRoutesProps> = ({ routes, shouldZoom }) => {
  const map = useMap();

  useEffect(() => {
    if (routes && routes.length > 0 && shouldZoom) {
      const allPositions: L.LatLngExpression[] = [];
      
      routes.forEach(route => {
        route.positions.forEach(pos => {
          allPositions.push([pos.lat, pos.lon]);
        });
      });

      if (allPositions.length > 0) {
        const bounds = L.latLngBounds(allPositions as L.LatLngBoundsLiteral);
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 20,
          animate: true,
          duration: 1
        });
      }
    }
  }, [routes, shouldZoom, map]);

  return null;
};


// Create continuous buffer polygons
const createBufferPolygon = (distanceMeters: number) => {
  const leftSide: [number, number][] = [];
  const rightSide: [number, number][] = [];
  
  for (let i = 0; i < polylineCoordinates.length - 1; i++) {
    const [lat1, lon1] = polylineCoordinates[i];
    const [lat2, lon2] = polylineCoordinates[i + 1];
    
    // Calculate bearing between points
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    const deltaLon = (lon2 - lon1) * Math.PI / 180;
    
    const y = Math.sin(deltaLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLon);
    
    const bearing = Math.atan2(y, x);
    
    // Calculate perpendicular bearings
    const perpBearingLeft = bearing - Math.PI / 2;
    const perpBearingRight = bearing + Math.PI / 2;
    
    // Calculate offset points
    const leftOffset1 = calculateOffset(lat1, lon1, perpBearingLeft, distanceMeters);
    const rightOffset1 = calculateOffset(lat1, lon1, perpBearingRight, distanceMeters);
    
    if (i === 0) {
      leftSide.push(leftOffset1);
      rightSide.push(rightOffset1);
    }
    
    const leftOffset2 = calculateOffset(lat2, lon2, perpBearingLeft, distanceMeters);
    const rightOffset2 = calculateOffset(lat2, lon2, perpBearingRight, distanceMeters);
    
    leftSide.push(leftOffset2);
    rightSide.push(rightOffset2);
  }
  
  // Create closed polygon by combining both sides
  return [...leftSide, ...rightSide.reverse()];
};

// Create cluster function
const createClusters = (markers: MarkerData[], zoomLevel: number, maxDistance: number = 50) => {
  if (!markers || zoomLevel > 15) return markers.map(m => ({ ...m, isCluster: false, count: 1 }));
  
  const clusters: Array<MarkerData & { isCluster: boolean; count: number; clusteredMarkers?: MarkerData[] }> = [];
  const processed = new Set<string>();
  
  markers.forEach(marker => {
    if (processed.has(marker.mmsi)) return;
    
    const latestPosition = marker.positions[0];
    if (!latestPosition) return;
    
    const cluster = [marker];
    processed.add(marker.mmsi);
    
    markers.forEach(otherMarker => {
      if (processed.has(otherMarker.mmsi)) return;
      
      const otherPosition = otherMarker.positions[0];
      if (!otherPosition) return;
      
      const distance = Math.sqrt(
        Math.pow(latestPosition.lat - otherPosition.lat, 2) + 
        Math.pow(latestPosition.lon - otherPosition.lon, 2)
      ) * 111000; // Convert to meters approximately
      
      if (distance < maxDistance) {
        cluster.push(otherMarker);
        processed.add(otherMarker.mmsi);
      }
    });
    
    if (cluster.length > 1) {
      const centerLat = cluster.reduce((sum, m) => sum + m.positions[0].lat, 0) / cluster.length;
      const centerLon = cluster.reduce((sum, m) => sum + m.positions[0].lon, 0) / cluster.length;
      
      clusters.push({
        ...marker,
        positions: [{
          ...latestPosition,
          lat: centerLat,
          lon: centerLon
        }],
        isCluster: true,
        count: cluster.length,
        clusteredMarkers: cluster
      });
    } else {
      clusters.push({
        ...marker,
        isCluster: false,
        count: 1
      });
    }
  });
  
  return clusters;
};

const buffer500m = createBufferPolygon(500);
const buffer1750m = createBufferPolygon(1750);

const DEFAULT_ROUTE_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Light Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E2', // Sky Blue
];

const MapComponent: FC<MapComponentProps> = ({
  markers,
  selectedMmsi,
  setSelectedMmsi,
  routes,
  zoomToRoutes = false,
}) => {
  const { setSelectedTile, selectedTile } = useTileStore();
  const [zoomLevel, setZoomLevel] = useState(12);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mmsiParam = urlParams.get("mmsi");
    if (mmsiParam) {
      setSelectedMmsi(mmsiParam);
    }
  }, [setSelectedMmsi]);

  const LayerChangeHandler: FC = () => {
    useMapEvents({
      baselayerchange: (event: L.LayersControlEvent) => {
        setSelectedTile(event.name);
      },
      zoom: (e) => {
        setZoomLevel(e.target.getZoom());
      },
    });
    return null;
  };

  // Enhanced zoom-based sizing for all elements
  const getZoomBasedSizes = (zoom: number) => {
    const baseMultiplier = Math.pow(1.2, zoom - 12);
    const iconWidth = Math.max(6, Math.min(32, 10 * baseMultiplier));
    const iconHeight = Math.max(9, Math.min(48, 15 * baseMultiplier));
    const selectedWidth = Math.max(8, Math.min(40, 20 * baseMultiplier));
    const selectedHeight = Math.max(12, Math.min(60, 30 * baseMultiplier));
    
    return {
      markerSize: [iconWidth, iconHeight] as [number, number],
      selectedMarkerSize: [selectedWidth, selectedHeight] as [number, number],
      lineWeight: Math.max(2, Math.min(6, zoom / 2.5)),
      circleRadius: Math.max(1, Math.min(8, zoom / 2)),
      clusterSize: Math.max(12, Math.min(32, 16 * baseMultiplier)),
      fontSize: Math.max(8, Math.min(14, 10 * baseMultiplier)),
      showKpPoints: zoom >= 13, // KP points only show when zoomed in enough
      routeWeight: Math.max(2, Math.min(5, zoom / 3)),
    };
  };

  const sizes = getZoomBasedSizes(zoomLevel);

  // Function to check if timestamp is too old (12 hours)
  const isTimestampTooOld = (timestamp: Date): boolean => {
    const currentTime = new Date();
    const twelveHoursAgo = new Date(currentTime.getTime() - 12 * 60 * 60 * 1000);
    return new Date(timestamp) < twelveHoursAgo;
  };

  const getIcon = (
    heading: number,
    isSelected: boolean,
    icon: string | undefined,
    isCluster: boolean = false,
    count: number = 1
  ) => {
    const iconSize = isSelected ? sizes.selectedMarkerSize : sizes.markerSize;

    if (isCluster && count > 1) {
      const clusterSize = sizes.clusterSize;
      return L.divIcon({
        className: "custom-cluster-icon",
        html: `
          <div style="
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(29, 78, 216, 0.9));
            border: 2px solid white;
            border-radius: 50%;
            width: ${clusterSize}px;
            height: ${clusterSize}px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
            font-size: ${sizes.fontSize}px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
          ">
            ${count}
          </div>
        `,
        iconSize: [clusterSize, clusterSize],
        iconAnchor: [clusterSize / 2, clusterSize / 2],
        popupAnchor: [0, -clusterSize / 2],
      });
    }

    const iconUrl = icon ? `ships/${icon}.png` : "ships/unknown.png";

    return L.divIcon({
      className: "custom-icon",
      html: `<img src="${iconUrl}" style="width: ${iconSize[0]}px; height: ${iconSize[1]}px; transform: rotate(${heading}deg); filter: drop-shadow(0 1px 2px rgba(0,0,0,0.4)); transition: all 0.3s ease;" />`,
      iconSize,
      iconAnchor: [iconSize[0] / 2, iconSize[1] / 2],
      popupAnchor: [0, -iconSize[1] / 2],
    });
  };

  const handleMarkerClick = (mmsi: string, clusteredMarkers?: MarkerData[]) => {
    if (clusteredMarkers && clusteredMarkers.length > 1) {
      // If it's a cluster, select the first one
      setSelectedMmsi(clusteredMarkers[0].mmsi);
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set("mmsi", clusteredMarkers[0].mmsi);
      window.history.pushState(null, "", "?" + urlParams.toString());
    } else {
      setSelectedMmsi(mmsi);
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set("mmsi", mmsi);
      window.history.pushState(null, "", "?" + urlParams.toString());
    }
  };

  // Filter valid markers and create clusters
  const validMarkers = useMemo(() => {
    return markers?.filter(marker => {
      const latestPosition = marker.positions[0];
      return latestPosition && !isTimestampTooOld(latestPosition.timestamp);
    }) || [];
  }, [markers]);

  const clusteredMarkers = useMemo(() => {
    const clusterDistance = Math.max(500, 2000 - (zoomLevel * 100)); // Dynamic clustering distance
    return createClusters(validMarkers, zoomLevel, clusterDistance);
  }, [validMarkers, zoomLevel]);

  // Process routes with colors
  const processedRoutes = useMemo(() => {
    if (!routes || routes.length === 0) return [];
    
    return routes.map((route, index) => ({
      ...route,
      color: route.color || DEFAULT_ROUTE_COLORS[index % DEFAULT_ROUTE_COLORS.length],
    }));
  }, [routes]);

  return (
    <MapContainer
      center={[1.143238, 103.856406]}
      zoom={12}
      style={{ height: "100vh", width: "100vw" }}
      className="w-full h-full z-0"
      zoomControl={false}
    >
      <LayerChangeHandler />
      <LayersControl position="bottomleft">
        <LayersControl.BaseLayer
          checked={selectedTile === "Leaflet"}
          name="Leaflet"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer
          checked={selectedTile === "Default"}
          name="Default"
        >
          <TileLayer
            url={`https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=${STADIA_MAPS_API_KEY}`}
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer
          checked={selectedTile === "Satellite"}
          name="Satellite"
        >
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        </LayersControl.BaseLayer>

        <ZoomToRoutes routes={routes} shouldZoom={zoomToRoutes} />

        {/* Main Pipeline */}
        <LayersControl.Overlay checked name="Main Pipeline">
          <Polyline
            positions={polylineCoordinates}
            color="black"
            weight={sizes.lineWeight}
            opacity={0.9}
          />
        </LayersControl.Overlay>

        {/* Restricted Zone 500m Buffer */}
        <LayersControl.Overlay checked name="Restricted Zone (500m)">
          <Polygon
            positions={buffer500m}
            pathOptions={{
              color: "red",
              weight: 2,
              opacity: 0.8,
              fillColor: "red",
              fillOpacity: 0.2
            }}
          />
        </LayersControl.Overlay>

        {/* Limited Area 1750m Buffer */}
        <LayersControl.Overlay checked name="Limited Area (1750m)">
          <Polygon
            positions={buffer1750m}
            pathOptions={{
              color: "orange",
              weight: 2,
              opacity: 0.8,
              fillColor: "yellow",
              fillOpacity: 0.15,
              dashArray: "10, 5"
            }}
          />
        </LayersControl.Overlay>

        {processedRoutes && processedRoutes.length > 0 && (
          <LayersControl.Overlay checked name="Ship Routes">
            <>
              {processedRoutes.map((route, routeIndex) => {
                // Ensure that route.positions has valid data
                const routeCoordinates: [number, number][] = route.positions
                  .filter(pos => pos.lat && pos.lon) // Ensure lat and lon are defined
                  .map(pos => [pos.lat, pos.lon]);

                console.log('Route Coordinates:', routeCoordinates); 

                if (routeCoordinates.length < 2) return null; // Ensure there are at least two points for the polyline

                return (
                  <Polyline
                    key={`route-${route.mmsi}-${routeIndex}`}
                    positions={routeCoordinates}
                    pathOptions={{
                      color: route.color,
                      weight: sizes.routeWeight,
                      opacity: 0.8,
                    }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-bold">Ship Route</p>
                        <p className="text-xs">MMSI: {route.mmsi}</p>
                        <p className="text-xs">Points: {routeCoordinates.length}</p>
                        <p className="text-xs">
                          Time Range: {new Date(route.positions[0].timestamp).toLocaleString()} - {new Date(route.positions[route.positions.length - 1].timestamp).toLocaleString()}
                        </p>
                      </div>
                    </Popup>
                  </Polyline>
                );
              })}
            </>
          </LayersControl.Overlay>
        )}

        {/* KP Points - only show when zoomed in enough */}
        {sizes.showKpPoints && (
          <LayersControl.Overlay checked name="KP Points">
            <>
              {sortedData.map((point, index) => (
                <CircleMarker
                  key={`kp-${index}`}
                  center={[point.Latitude, point.Longitude]}
                  radius={sizes.circleRadius}
                  pathOptions={{
                    color: "blue",
                    fillColor: "lightblue",
                    fillOpacity: 0.7,
                    weight: Math.max(1, sizes.circleRadius / 3)
                  }}
                >
                  <Popup>
                    <div className="text-center">
                      <h3 className="font-bold text-sm">{point.Name}</h3>
                      <p className="text-xs text-gray-600">
                        Lat: {point.Latitude.toFixed(6)}
                      </p>
                      <p className="text-xs text-gray-600">
                        Lon: {point.Longitude.toFixed(6)}
                      </p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </>
          </LayersControl.Overlay>
        )}
      </LayersControl>

      {clusteredMarkers.map((marker, index) => {
        const isSelected = marker.mmsi === selectedMmsi;
        const latestPosition = marker.positions[0];
        
        return (
          <Marker
            key={`marker-${marker.mmsi}-${index}`}
            position={[latestPosition.lat, latestPosition.lon]}
            icon={getIcon(
              latestPosition?.cog || 0, 
              isSelected, 
              marker?.icon,
              marker.isCluster, 
              marker.count
            )}
            eventHandlers={{
              click: () => handleMarkerClick(marker.mmsi),
            }}
          >
            {marker.isCluster && marker.count > 1 ? (
              ""
            ) : (
              <MarkerPopup marker={marker} />
            )}
          </Marker>
        );
      })}
      
      <ZoomControl position="bottomleft" />
    </MapContainer>
  );
};

export default MapComponent;