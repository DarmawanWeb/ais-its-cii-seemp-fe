import { FC } from "react";
import { Card, CardHeader, CardContent } from "../../../components/ui/card";
import { Database } from "lucide-react";

export interface Cii {
  year: number;
  ciiRequired: number;
  ciiAttained: number;
  ciiRating: number;
  ciiGrade: string;
}

export interface CiiValueCardProps {
  cii: Cii; // Now accepting a single Cii object instead of an array
}

const CiiValueCard: FC<CiiValueCardProps> = ({ cii }) => {
  const renderCiiContent = (cii: Cii) => (
    <section className="text-base">
      <div className="h-0.5 bg-black w-56 mx-auto my-4"></div>
      <div className="grid grid-cols-2">
        <b>CII Required</b> <p> : {cii.ciiRequired}</p>
        <b>CII Attained</b> <p> : {cii.ciiAttained}</p>
      </div>
      <div className="h-0.5 bg-black w-56 mx-auto my-4"></div>
      <div className="grid grid-cols-2">
        <b className="col-span-2">CII Rating</b>
        <b>Number </b> <p> : {cii.ciiRating}</p>
        <b>Grade </b> <p> : {cii.ciiGrade}</p>
      </div>
    </section>
  );

  return (
    <Card>
      <CardHeader className="bg-blue-200 text-black p-1 rounded-t-lg -mt-6 relative">
        <h3 className="text-xl font-semibold text-center">CII Value</h3>
      </CardHeader>
      <CardContent className="p-2 -mt-6 text-xs space-y-2 h-full">
        {cii ? (
          renderCiiContent(cii) // Directly pass the single Cii to renderContent
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
