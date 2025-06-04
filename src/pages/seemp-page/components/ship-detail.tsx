import { ShipData } from "./ship-info-card";
import { LabelValuePair } from "../../../components/common/label-value-pair";

export const VesselDetails = ({ ship }: { ship: ShipData }) => (
  <div className="grid grid-cols-3 gap-y-0.5 text-xs">
    <LabelValuePair label="Name" value={ship.NAME} />
    <LabelValuePair label="MMSI" value={ship.MMSI} />
    <LabelValuePair label="IMO" value={ship.IMO} />
    <LabelValuePair label="Flag" value={ship.FLAG} />
    <LabelValuePair label="Type" value={ship.TYPE} />
    <LabelValuePair label="Built" value={ship.BUILT} />
    <LabelValuePair label="GT" value={ship.GT} />
    <LabelValuePair label="DWT" value={ship.DWT} />
    <LabelValuePair label="LOA" value={`${ship.LOA} m`} />
    <LabelValuePair label="Beam" value={`${ship.BEAM} m`} />
    <LabelValuePair label="Draught" value={`${ship.DRAUGHT} m`} />
  </div>
);
