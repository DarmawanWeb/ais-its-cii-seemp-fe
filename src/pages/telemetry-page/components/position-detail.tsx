import { IAisPosition } from "../../../components/common/map";
import { LabelValuePair } from "../../../components/common/label-value-pair";
import { getNavStatusLabel } from "../../../lib/navstatus-label";

export const PositionDetails = ({ pos }: { pos: IAisPosition[] }) => {
  return (
    <div className="grid grid-cols-3 gap-y-0.5 text-xs -mt-3.5">
      <LabelValuePair label="Speed" value={`${pos[0].sog} kn`} />
      <LabelValuePair label="Course" value={`${pos[0].cog}°`} />
      <LabelValuePair label="Heading" value={`${pos[0].hdg}°`} />
      <LabelValuePair
        label="Nav Status"
        value={getNavStatusLabel(pos[0].navstatus)}
      />
    </div>
  );
};
