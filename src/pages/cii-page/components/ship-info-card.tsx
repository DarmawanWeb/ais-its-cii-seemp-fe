import { FC } from "react";
import { Card, CardHeader, CardContent } from "../../../components/ui/card";
import { Ship } from "lucide-react";
import { Button } from "../../../components/ui/button";

export interface ShipData {
  name: string;
  mmsi: string;
  imo: string;
  flag: string;
  type: string;
  foto: string;
  lwl: number;
  capacity: number;
  breadth: number;
  draft: number;
  lat: number;
  lon: number;
  sog: number;
  cog: number;
  port: string;
}

export interface ShipInfoProps {
  shipData: ShipData | null;
}

const ShipInfoCard: FC<ShipInfoProps> = ({ shipData }) => {
  return (
    <Card className="row-span-5 h-full">
      <CardHeader className="bg-blue-200 text-black p-2 rounded-t-lg -mt-6">
        <h3 className="text-base font-semibold ml-4 text-center">
          Ship Information
        </h3>
      </CardHeader>
      <CardContent className="text-sm  h-full ">
        {shipData ? (
          <section className="w-full flex flex-col justify-between h-full">
            <div className="grid grid-cols-2 justify-between h-full">
              <div className="font-semibold text-xs">Name</div>
              <div className="text-xs">: {shipData.name}</div>
              <div className="font-semibold text-xs">MMSI</div>
              <div className="text-xs">: {shipData.mmsi}</div>
              <div className="font-semibold text-xs">IMO</div>
              <div className="text-xs">: {shipData.imo}</div>
              <div className="font-semibold text-xs">Flag</div>
              <div className="text-xs">: {shipData.flag}</div>
              <div className="font-semibold text-xs">Type</div>
              <div className="text-xs">: {shipData.type}</div>
              <div className="font-semibold text-xs">LWL</div>
              <div className="text-xs">: {shipData.lwl}</div>
              <div className="font-semibold text-xs">Breadth</div>
              <div className="text-xs">: {shipData.breadth}</div>
              <div className="font-semibold text-xs">Draft</div>
              <div className="text-xs">: {shipData.draft}</div>
              <div className="font-semibold text-xs">Latitude</div>
              <div className="text-xs">: {shipData.lat}</div>
              <div className="font-semibold text-xs">Longitude</div>
              <div className="text-xs">: {shipData.lon}</div>
              <div className="font-semibold text-xs">Speed (SOG)</div>
              <div className="text-xs">: {shipData.sog}</div>
              <div className="font-semibold text-xs">Course (COG)</div>
              <div className="text-xs">: {shipData.cog}</div>
            </div>
            <div className="flex justify-center mt-4">
              <img
                src={shipData.foto}
                alt="Ship"
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>
            <Button
              variant="default"
              className="w-40 ml-7 mt-4 mx-auto "
              size={"sm"}
            >
              Calculate CII
            </Button>
          </section>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 h-full">
            <Ship className="text-gray-400" size={40} />
            <div className="text-sm text-gray-600">
              Ship data will appear here
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShipInfoCard;
