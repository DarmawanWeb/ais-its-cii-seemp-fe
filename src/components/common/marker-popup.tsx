import { Popup } from "react-leaflet";
import { formatDistanceToNow } from "date-fns";
import type { MarkerData } from "./map";
import { getNavStatusLabel } from "../../lib/navstatus-label";
interface MarkerPopupProps {
  marker: MarkerData;
}

export function MarkerPopup({ marker }: MarkerPopupProps) {
  const pos = marker.positions[0];
  const updatedAgo = formatDistanceToNow(new Date(pos.timestamp), {
    addSuffix: true,
  });

  return (
    <Popup>
      <div className="text-xs space-y-0.5 font-medium text-muted-foreground">
        <div>
          <b>MMSI:</b> {marker.mmsi}
        </div>
        <div>
          <b>AIS Navstatus:</b>{" "}
          {getNavStatusLabel(pos.navstatus) ?? `Unknown (${pos.navstatus})`}
        </div>
         <div>
          <b>Predicted Navstatus:</b>{" "}
          {getNavStatusLabel(pos.predictedNavStatus) ?? `Unknown (${pos.predictedNavStatus})`}
        </div>
        <div>
          <b>Lat/Lon:</b> {pos.lat.toFixed(5)} / {pos.lon.toFixed(5)}
        </div>
        <div>
          <b>HDG:</b> {pos.hdg}° <b>COG:</b> {pos.cog}° <b>SOG:</b> {pos.sog} kn
        </div>
        <div className="text-[10px] italic mt-1">Updated {updatedAgo}</div>
      </div>
    </Popup>
  );
}
