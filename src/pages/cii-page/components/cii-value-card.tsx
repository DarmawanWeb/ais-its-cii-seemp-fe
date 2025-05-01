import { FC } from "react";
import { Card, CardHeader, CardContent } from "../../../components/ui/card";
import { Database } from "lucide-react";

type Fuel = {
  fuelMe: number;
  fuelAE: number;
  total: number;
};

// Define the Cii type
export type Cii = {
  ciiRequired: number;
  ciiAttained: number;
  ciiRating: number;
  ciiGrade: string;
};

export type CiiData = {
  year: number;
  fuel: Fuel;
  cii: Cii;
};
export interface CiiValueCardProps {
  cii: CiiData;
}

const CiiValueCard: FC<CiiValueCardProps> = ({ cii }) => {
  const renderCiiContent = (cii: CiiData) => (
    <section className="text-xs flex justify-between flex-col h-full">
      <div className="h-0.5 bg-black w-full mx-auto my-2"></div>
      <div className="grid grid-cols-3 ml-4">
        <b className="col-span-2">ME Fuel Consumption</b>{" "}
        <p> : {cii.fuel.fuelMe} ton</p>
        <b className="col-span-2">AE Fuel Consumption</b>{" "}
        <p> : {cii.fuel.fuelAE} ton</p>
        <b className="col-span-2">Total Fuel Consumption</b>{" "}
        <p> : {cii.fuel.total} ton</p>
      </div>
      <div className="h-0.5 bg-black w-full mx-auto my-2"></div>
      <div className="grid grid-cols-3  ml-4">
        <b className="col-span-2">CII Required</b>{" "}
        <p> : {cii.cii.ciiRequired}</p>
        <b className="col-span-2">CII Attained</b>{" "}
        <p> : {cii.cii.ciiAttained}</p>
      </div>
      <div className="h-0.5 bg-black w-full mx-auto my-2"></div>
      <div className="grid grid-cols-3 ml-4">
        <b className="col-span-3">CII Rating</b>
        <b className="col-span-2">Number </b> <p> : {cii.cii.ciiRating}</p>
        <b className="col-span-2">Grade </b> <p> : {cii.cii.ciiGrade}</p>
      </div>
    </section>
  );

  return (
    <Card className="w-[350px] -mr-4 mb-4">
      <CardHeader className="bg-blue-200 text-black p-2 rounded-t-lg -mt-6 relative">
        <h3 className="text-base font-semibold text-center">CII Value</h3>
      </CardHeader>
      <CardContent className="p-2 -mt-6 text-sm space-y-2 h-full">
        {cii ? (
          renderCiiContent(cii)
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2  h-full">
            <Database className="text-gray-400" size={40} />
            <div className="text-sm text-gray-600">Data will appear here</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CiiValueCard;
