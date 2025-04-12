import { FC } from "react";
import { Card, CardHeader, CardContent } from "../../../components/ui/card";
import { Ship } from "lucide-react"; // Import Ship icon from Lucide React

interface ShipInfoProps {
  shipData: { id: number; name: string; value: string }[] | null; // Allow null for when there's no data
}

const ShipInfoCard: FC<ShipInfoProps> = ({ shipData }) => {
  return (
    <Card className="row-span-4">
      <CardHeader className="bg-blue-200 text-black p-2 rounded-t-lg -mt-6">
        <h3 className="text-lg font-semibold ml-4 text-center">
          Ship Information
        </h3>
      </CardHeader>
      <CardContent className="text-xs -mt-3 space-y-2 h-full">
        {shipData && shipData.length > 0 ? (
          shipData.map(({ id, name, value }) => (
            <div key={id} className="grid grid-cols-2 gap-2">
              <div className="font-semibold">{name}</div>
              <div>{value}</div>
            </div>
          ))
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
