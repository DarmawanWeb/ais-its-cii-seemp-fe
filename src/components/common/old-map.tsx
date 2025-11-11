import { FC, useEffect, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  LayersControl,
  ZoomControl,
  Popup,
  Polyline,
  Polygon,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { LatLngExpression, Layer } from "leaflet";
import "leaflet.heat";
import useTileStore from "../../hooks/use-selected-tile";
import restrictedZoneData from "../../data/pipe.json";
import oldShipDataRaw from "../../data/ilegal.json";
import { STADIA_MAPS_API_KEY } from "../../lib/env";

const oldShipData: OldShip[] = oldShipDataRaw.map((ship) => ({
  name: ship.name,
  lat: ship.lat,
  lon: ship.lng,
  violation: ship.violation,
  follow_up: ship.action,
  inspection_date: ship.year,
}));

// ===================== TYPE DEFINITIONS =====================
type OldShip = {
  name: string;
  lat: number;
  lon: number;
  fishing_vessel_name?: string;
  violation?: string;
  follow_up?: string;
  inspection_date?: string;
};

type ClusteredShip = OldShip & {
  isCluster: boolean;
  count: number;
  clusteredShips?: OldShip[];
};

// ===================== PIPELINE =====================
const sortedData = restrictedZoneData.sort((a, b) => {
  const aKp = parseFloat(a.Name.replace("KP ", ""));
  const bKp = parseFloat(b.Name.replace("KP ", ""));
  return aKp - bKp;
});

const polylineCoordinates: [number, number][] = sortedData.map((p) => [
  p.Latitude,
  p.Longitude,
]);

// ===================== UTILS =====================
const calculateOffset = (
  lat: number,
  lon: number,
  bearing: number,
  distanceMeters: number
): [number, number] => {
  const R = 6378137;
  const d = distanceMeters / R;
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;

  const newLatRad = Math.asin(
    Math.sin(latRad) * Math.cos(d) +
      Math.cos(latRad) * Math.sin(d) * Math.cos(bearing)
  );
  const newLonRad =
    lonRad +
    Math.atan2(
      Math.sin(bearing) * Math.sin(d) * Math.cos(latRad),
      Math.cos(d) - Math.sin(latRad) * Math.sin(newLatRad)
    );

  return [(newLatRad * 180) / Math.PI, (newLonRad * 180) / Math.PI];
};

const createBufferPolygon = (distanceMeters: number): [number, number][] => {
  const left: [number, number][] = [];
  const right: [number, number][] = [];

  for (let i = 0; i < polylineCoordinates.length - 1; i++) {
    const [lat1, lon1] = polylineCoordinates[i];
    const [lat2, lon2] = polylineCoordinates[i + 1];

    const lat1Rad = (lat1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;
    const deltaLon = ((lon2 - lon1) * Math.PI) / 180;

    const y = Math.sin(deltaLon) * Math.cos(lat2Rad);
    const x =
      Math.cos(lat1Rad) * Math.sin(lat2Rad) -
      Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLon);
    const bearing = Math.atan2(y, x);

    const left1 = calculateOffset(lat1, lon1, bearing - Math.PI / 2, distanceMeters);
    const right1 = calculateOffset(lat1, lon1, bearing + Math.PI / 2, distanceMeters);
    const left2 = calculateOffset(lat2, lon2, bearing - Math.PI / 2, distanceMeters);
    const right2 = calculateOffset(lat2, lon2, bearing + Math.PI / 2, distanceMeters);

    if (i === 0) {
      left.push(left1);
      right.push(right1);
    }
    left.push(left2);
    right.push(right2);
  }

  return [...left, ...right.reverse()];
};

const buffer500m = createBufferPolygon(500);
const buffer1750m = createBufferPolygon(1750);

// ===================== HEATMAP =====================
const HeatmapLayer: FC<{ data: OldShip[] }> = ({ data }) => {
  const map = useMapEvents({});

  useEffect(() => {
    if (!map || !data?.length) return;

    const points: [number, number, number][] = data
      .filter((p) => p.lat && p.lon)
      .map((p) => [p.lat, p.lon, 0.6]);

    const heat = (L as typeof L & { heatLayer: (points: [number, number, number][], opts: Record<string, unknown>) => Layer })
      .heatLayer(points, {
        radius: 25,
        blur: 20,
        maxZoom: 12,
        minOpacity: 0.4,
        gradient: { 0.4: "blue", 0.6: "lime", 0.9: "red" },
      });

    heat.addTo(map);
    return () => {
      map.removeLayer(heat);
    };
  }, [map, data]);

  return null;
};

// ===================== CLUSTERING =====================
const createClusters = (ships: OldShip[], zoom: number, maxDistance = 300): ClusteredShip[] => {
  if (!ships?.length) return [];
  if (zoom > 13) return ships.map((s) => ({ ...s, isCluster: false, count: 1 }));

  const clusters: ClusteredShip[] = [];
  const processed = new Set<string>();

  ships.forEach((ship) => {
    if (processed.has(ship.name)) return;

    const cluster: OldShip[] = [ship];
    processed.add(ship.name);

    ships.forEach((other) => {
      if (processed.has(other.name)) return;

      const distance = L.latLng(ship.lat, ship.lon).distanceTo(L.latLng(other.lat, other.lon));
      if (distance < maxDistance) {
        cluster.push(other);
        processed.add(other.name);
      }
    });

    if (cluster.length > 1) {
      const avgLat = cluster.reduce((sum, s) => sum + s.lat, 0) / cluster.length;
      const avgLon = cluster.reduce((sum, s) => sum + s.lon, 0) / cluster.length;
      clusters.push({
        ...ship,
        lat: avgLat,
        lon: avgLon,
        isCluster: true,
        count: cluster.length,
        clusteredShips: cluster,
      });
    } else {
      clusters.push({ ...ship, isCluster: false, count: 1 });
    }
  });

  return clusters;
};

// ===================== MAIN MAP =====================
const MapOldShips: FC = () => {
  const { setSelectedTile } = useTileStore();
  const [zoomLevel, setZoomLevel] = useState<number>(6);

  const LayerChangeHandler: FC = () => {
    useMapEvents({
      baselayerchange: (e) => setSelectedTile(e.name),
      zoom: (e) => setZoomLevel(e.target.getZoom()),
    });
    return null;
  };

  const defaultCenter: [number, number] = [1.143238, 103.856406];

  const clusteredShips = useMemo(() => {
    const clusterDist = Math.max(100, 2000 - zoomLevel * 100);
    return createClusters(oldShipData, zoomLevel, clusterDist);
  }, [zoomLevel]);

  const getIcon = (isCluster: boolean, count: number): L.DivIcon => {
    if (isCluster && count > 1) {
      const size = Math.min(40, 20 + count);
      return L.divIcon({
        html: `
          <div style="
            background: rgba(255, 140, 0, 0.9);
            border-radius: 50%;
            border: 2px solid white;
            width: ${size}px; height: ${size}px;
            display: flex; align-items: center; justify-content: center;
            color: white; font-size: 12px; font-weight: bold;">
            ${count}
          </div>`,
        iconSize: [size, size],
        className: "",
      });
    }

    return L.divIcon({
      html: `
        <div style="
          font-size: 20px;
          color: #FFD700;
          text-shadow: 0 0 2px black;
        ">
          ⚠️
        </div>
      `,
      className: "",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  return (
    <MapContainer
      center={defaultCenter}
      zoom={zoomLevel}
      style={{ height: "100vh", width: "100vw" }}
      zoomControl={false}
    >
      <LayerChangeHandler />
      <LayersControl position="bottomleft">
        {/* BASE MAPS */}
        <LayersControl.BaseLayer checked name="Leaflet">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="Default">
          <TileLayer
            url={`https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=${STADIA_MAPS_API_KEY}`}
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="Satellite">
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        </LayersControl.BaseLayer>

        {/* PIPELINE */}
        <LayersControl.Overlay checked name="Main Pipeline">
          <Polyline positions={polylineCoordinates} color="black" weight={2} />
        </LayersControl.Overlay>

        <LayersControl.Overlay checked name="Restricted Zone (500m)">
          <Polygon positions={buffer500m} pathOptions={{ color: "red", fillOpacity: 0.2 }} />
        </LayersControl.Overlay>

        <LayersControl.Overlay checked name="Limited Area (1750m)">
          <Polygon positions={buffer1750m} pathOptions={{ color: "orange", fillOpacity: 0.15 }} />
        </LayersControl.Overlay>

        {/* HEATMAP */}
        <LayersControl.Overlay name="Heatmap (Old Ships)">
          <HeatmapLayer data={oldShipData} />
        </LayersControl.Overlay>

        {/* OLD SHIP MARKERS */}
        <LayersControl.Overlay checked name="Old Ships">
          <>
            {clusteredShips.map((ship, idx) => (
              <Marker
                key={`ship-${idx}`}
                position={[ship.lat, ship.lon] as LatLngExpression}
                icon={getIcon(ship.isCluster, ship.count)}
              >
                <Popup>
                  {ship.isCluster ? (
                    <div className="text-[12px] leading-tight space-y-0.5">
                      <b>Cluster of {ship.count} ships</b>
                      <ul className="list-disc pl-4 text-[11px] mt-1">
                        {ship.clusteredShips?.slice(0, 5).map((s, i) => (
                          <li key={i}>{s.name}</li>
                        ))}
                      </ul>
                      {ship.count > 5 && (
                        <p className="text-[10px] text-gray-500">and more...</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-[11px] leading-tight space-y-0.5">
                      <p className="font-semibold">{ship.name}</p>
                      <p className="text-gray-600">{ship.fishing_vessel_name}</p>
                      <p>Violation: {ship.violation}</p>
                      <p>Follow-up: {ship.follow_up}</p>
                      <p>
                        Lat: {ship.lat.toFixed(3)}, Lon: {ship.lon.toFixed(3)}
                      </p>
                      <p className="text-gray-500">Inspected: {ship.inspection_date}</p>
                    </div>
                  )}
                </Popup>
              </Marker>
            ))}
          </>
        </LayersControl.Overlay>
      </LayersControl>
      <ZoomControl position="bottomleft" />
    </MapContainer>
  );
};

export default MapOldShips;
