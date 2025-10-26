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
  Rectangle,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import useTileStore from "../../hooks/use-selected-tile";
import { MarkerPopup } from "./marker-popup";
import { STADIA_MAPS_API_KEY } from "../../lib/env";

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

export interface MapComponentProps {
  markers: MarkerData[] | null;
  selectedMmsi: string | null;
  setSelectedMmsi: (mmsi: string | null) => void;
  routes?: ShipRoute[] | null;
  illegalAreas?: IllegalTransshipmentArea[] | null;
}

// Data points from the provided JSON
const restrictedZoneData = [
  {"Latitude": -6.87197219605424, "Longitude": 112.719384869178, "Name": "KP 29.200"},
  {"Latitude": -6.86293886272091, "Longitude": 112.719433852143, "Name": "KP 28.200"},
  {"Latitude": -6.85389719605424, "Longitude": 112.719446655722, "Name": "KP 27.200"},
  {"Latitude": -6.85389660250285, "Longitude": 112.719447222222, "Name": "KP 26.700"},
  {"Latitude": -6.88101386272091, "Longitude": 112.719227390428, "Name": "KP 30.200"},
  {"Latitude": -6.89001386272091, "Longitude": 112.718825500619, "Name": "KP 31.200"},
  {"Latitude": -6.89841664049869, "Longitude": 112.715489981399, "Name": "KP 32.200"},
  {"Latitude": -6.90678330716535, "Longitude": 112.712072813874, "Name": "KP 33.200"},
  {"Latitude": -6.91514997383202, "Longitude": 112.708664604489, "Name": "KP 34.200"},
  {"Latitude": -6.92354441827647, "Longitude": 112.70531974069, "Name": "KP 35.200"},
  {"Latitude": -6.9319027516098, "Longitude": 112.701847980912, "Name": "KP 36.200"},
  {"Latitude": -6.9402777516098, "Longitude": 112.698457631052, "Name": "KP 37.200"},
  {"Latitude": -6.94861941827647, "Longitude": 112.694976573673, "Name": "KP 38.200"},
  {"Latitude": -6.95692219605424, "Longitude": 112.691404803613, "Name": "KP 39.200"},
  {"Latitude": -6.96532497383202, "Longitude": 112.688005226575, "Name": "KP 40.200"},
  {"Latitude": -6.97367497383202, "Longitude": 112.684532969974, "Name": "KP 41.200"},
  {"Latitude": -6.9820777516098, "Longitude": 112.68121465524, "Name": "KP 42.200"},
  {"Latitude": -7.03628608494313, "Longitude": 112.66092719921, "Name": "KP 42.720"},
  {"Latitude": -6.99051664049869, "Longitude": 112.677959729256, "Name": "KP 42.200"},
  {"Latitude": -7.03913886272091, "Longitude": 112.660077510089, "Name": "KP 48.050"},
  {"Latitude": -7.04262219605424, "Longitude": 112.659184810399, "Name": "KP 48.450"},
  {"Latitude": -7.04618608494313, "Longitude": 112.658608333333, "Name": "KP 48.850"},
  {"Latitude": -7.04990552938758, "Longitude": 112.657933333333, "Name": "KP 49.270"},
  {"Latitude": -7.05359719605424, "Longitude": 112.657241666667, "Name": "KP 49.680"},
  {"Latitude": -7.05714441827646, "Longitude": 112.656594444444, "Name": "KP 50.080"},
  {"Latitude": -7.06057219605424, "Longitude": 112.656027777778, "Name": "KP 50.470"},
  {"Latitude": -7.06394719605424, "Longitude": 112.65535, "Name": "KP 50.850"},
  {"Latitude": -7.06762219605424, "Longitude": 112.654722222222, "Name": "KP 51.260"},
  {"Latitude": -7.07124164049869, "Longitude": 112.654083333333, "Name": "KP 51.670"},
  {"Latitude": -7.07498608494313, "Longitude": 112.653344444444, "Name": "KP 52.090"},
  {"Latitude": -7.0786777516098, "Longitude": 112.652605555556, "Name": "KP 52.510"},
  {"Latitude": -7.08229719605424, "Longitude": 112.652075, "Name": "KP 52.910"},
  {"Latitude": -7.08602497383202, "Longitude": 112.6515, "Name": "KP 53.330"},
  {"Latitude": -7.08980552938758, "Longitude": 112.651261111111, "Name": "KP 53.750"},
  {"Latitude": -7.09339441827646, "Longitude": 112.651491666667, "Name": "KP 54.150"},
  {"Latitude": -7.09704719605424, "Longitude": 112.651775, "Name": "KP 54.550"},
  {"Latitude": -7.10026664049869, "Longitude": 112.651841666667, "Name": "KP 54.910"},
  {"Latitude": -7.10394441827646, "Longitude": 112.651972222222, "Name": "KP 55.310"},
  {"Latitude": -7.10748052938758, "Longitude": 112.652219444444, "Name": "KP 55.710"},
  {"Latitude": -7.11163886272091, "Longitude": 112.652380555556, "Name": "KP 56.170"},
  {"Latitude": -7.11541664049869, "Longitude": 112.652627777778, "Name": "KP 56.590"},
  {"Latitude": -7.11901664049869, "Longitude": 112.652858333333, "Name": "KP 56.990"},
  {"Latitude": -7.12268608494313, "Longitude": 112.652997222222, "Name": "KP 57.390"},
  {"Latitude": -7.12626664049869, "Longitude": 112.653211111111, "Name": "KP 57.790"},
  {"Latitude": -7.12969997383202, "Longitude": 112.653422222222, "Name": "KP 58.170"},
  {"Latitude": -7.13329164049869, "Longitude": 112.653561111111, "Name": "KP 58.570"},
  {"Latitude": -7.13680552938758, "Longitude": 112.654280555556, "Name": "KP 58.970"},
  {"Latitude": -7.14021108494313, "Longitude": 112.655513888889, "Name": "KP 59.370"},
  {"Latitude": -7.1307777516098, "Longitude": 112.653508333333, "Name": "KP 58.290"},
  {"Latitude": -7.13187219605424, "Longitude": 112.653555555556, "Name": "KP 58.410"},
  {"Latitude": -7.1328027516098, "Longitude": 112.653561111111, "Name": "KP 58.510"},
  {"Latitude": -7.13402219605424, "Longitude": 112.653563888889, "Name": "KP 58.650"},
  {"Latitude": -7.13501664049869, "Longitude": 112.653738888889, "Name": "KP 58.760"},
  {"Latitude": -7.13611108494313, "Longitude": 112.654016666667, "Name": "KP 58.880"},
  {"Latitude": -7.1371027516098, "Longitude": 112.654416666667, "Name": "KP 59.000"},
  {"Latitude": -7.1380777516098, "Longitude": 112.654847222222, "Name": "KP 59.120"},
  {"Latitude": -7.13912497383202, "Longitude": 112.655194444445, "Name": "KP 59.240"},
  {"Latitude": -7.14105830716535, "Longitude": 112.655780555556, "Name": "KP 59.470"},
  {"Latitude": -7.14206108494313, "Longitude": 112.656127777778, "Name": "KP 59.580"},
  {"Latitude": -7.14309997383202, "Longitude": 112.656558333333, "Name": "KP 59.710"},
  {"Latitude": -7.1438932181303, "Longitude": 112.656890832097, "Name": "KP 59.850"}
];

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
  illegalAreas,
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
    const twelveHoursAgo = new Date(currentTime.getTime() - 0.5 * 60 * 60 * 1000);
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

        {/* Ship Routes */}
        {processedRoutes && processedRoutes.length > 0 && (
          <LayersControl.Overlay checked name="Ship Routes">
            <>
              {processedRoutes.map((route, routeIndex) => {
                const routeCoordinates: [number, number][] = route.positions
                  .filter(pos => pos.lat && pos.lon)
                  .map(pos => [pos.lat, pos.lon]);
                
                if (routeCoordinates.length < 2) return null;

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

        {/* Illegal Transshipment Areas */}
        {illegalAreas && illegalAreas.length > 0 && (
          <LayersControl.Overlay checked name="Suspected Illegal Transshipment">
            <>
              {illegalAreas.map((area, areaIndex) => {
                const bounds: [[number, number], [number, number]] = [
                  [area.latBottom, area.lonLeft],
                  [area.latTop, area.lonRight]
                ];

                return (
                  <Rectangle
                    key={`illegal-area-${areaIndex}`}
                    bounds={bounds}
                    pathOptions={{
                      color: "#DC2626",
                      weight: 3,
                      opacity: 0.9,
                      fillColor: "#FEE2E2",
                      fillOpacity: 0.4,
                      // dashArray: "10, 5",
                    }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-bold text-red-600">⚠️ Suspected Illegal Transshipment</p>
                        {area.confidence && (
                          <p className="text-xs mt-1">
                            Confidence: {(area.confidence * 100).toFixed(1)}%
                          </p>
                        )}
                        <p className="text-xs mt-1">
                          Coordinates:
                        </p>
                        <p className="text-xs">
                          Top: {area.latTop.toFixed(6)}
                        </p>
                        <p className="text-xs">
                          Bottom: {area.latBottom.toFixed(6)}
                        </p>
                        <p className="text-xs">
                          Left: {area.lonLeft.toFixed(6)}
                        </p>
                        <p className="text-xs">
                          Right: {area.lonRight.toFixed(6)}
                        </p>
                        {area.timestamp && (
                          <p className="text-xs mt-1">
                            Detected: {new Date(area.timestamp).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Rectangle>
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