import { FC, useState } from "react";
import { Card, CardHeader, CardContent } from "../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Database } from "lucide-react";

export interface Cii {
  year: number;
  ciiRequired: number;
  ciiAttained: number;
  ciiRating: number;
  ciiGrade: string;
}

export interface CiiValueCardProps {
  ciis: Cii[];
}

const CiiValueCard: FC<CiiValueCardProps> = ({ ciis }) => {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const handleYearChange = (year: string) => {
    const newYear = Number(year);
    setSelectedYear(newYear);
    console.log("Selected Year:", selectedYear);
  };

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

  const isDataAvailable = ciis && ciis.length > 0;

  return (
    <Card>
      <CardHeader className="bg-blue-200 text-black p-1 rounded-t-lg -mt-6 relative">
        <h3 className="text-xl font-semibold text-center">CII Value</h3>
      </CardHeader>
      <CardContent className="p-2 -mt-6 text-xs space-y-2 h-full">
        {isDataAvailable ? (
          <Select onValueChange={handleYearChange}>
            <SelectTrigger className="w-full cursor-pointer z-50">
              <SelectValue
                placeholder={
                  selectedYear === null ? "Select Year" : `${selectedYear}`
                }
              />
            </SelectTrigger>
            <SelectContent className="z-100 absolute">
              <SelectGroup>
                <SelectLabel>Select Year</SelectLabel>
                {ciis.map((cii) => (
                  <SelectItem key={cii.year} value={cii.year.toString()}>
                    {cii.year}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        ) : null}

        {isDataAvailable && selectedYear !== null ? (
          selectedYear !== null &&
          ciis.find((cii) => cii.year === selectedYear) !== undefined ? (
            renderCiiContent(ciis.find((cii) => cii.year === selectedYear)!)
          ) : null
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
