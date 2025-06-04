import { FC } from "react";
import { Card, CardHeader, CardContent } from "../../../components/ui/card";
import { VesselDetails } from "./ship-detail";
import { PositionDetails } from "./position-detail";
import { IAisPosition } from "../../../components/common/map";
import DataNotFound from "../../../components/common/data-not-found";

export interface ShipData {
  NAME: string;
  MMSI: string;
  IMO: string;
  FLAG: string;
  TYPE: string;
  BUILT: number;
  GT: number;
  DWT: number;
  LOA: number;
  BEAM: number;
  DRAUGHT: number;
  positions: IAisPosition[];
}

export interface ShipInfoProps {
  shipData: ShipData | null;
}

const ShipInfoCard: FC<ShipInfoProps> = ({ shipData }) => {
  return (
    <Card className="row-span-5 h-full overflow-auto rounded-md border border-gray-300">
      <CardHeader className="bg-blue-200 text-black px-3 py-2">
        <h3 className="text-sm font-semibold text-center">Ship Information</h3>
      </CardHeader>
      <CardContent className="px-3 flex flex-col gap-4 h-full">
        {!shipData ? (
          <DataNotFound />
        ) : (
          <>
            <VesselDetails ship={shipData} />
            {shipData.positions && <PositionDetails pos={shipData.positions} />}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ShipInfoCard;
