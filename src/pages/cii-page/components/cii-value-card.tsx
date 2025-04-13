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
import { Database } from "lucide-react"; // Import the Database icon for the fallback

interface CiiValueCardProps {
  ciiData: { id: number; name: string; value: string }[] | null;
  ciiDataRating: { id: number; name: string; value: string }[] | null;
}

const CiiValueCard: FC<CiiValueCardProps> = ({ ciiData, ciiDataRating }) => {
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    console.log("Selected CII Year:", year);
  };

  const renderCiiContent = (
    data: { id: number; name: string; value: string }[]
  ) => {
    return data?.map(({ id, name, value }) => (
      <div className="grid grid-cols-5" key={id}>
        <div className="font-semibold col-span-3">{name}</div>
        <div className="col-span-2 w-full">{value}</div>
      </div>
    ));
  };

  const isDataAvailable = ciiData && ciiDataRating;

  return (
    <Card>
      <CardHeader className="bg-blue-200 text-black p-1 rounded-t-lg -mt-6 relative">
        <h3 className="text-xl font-semibold text-center">CII Value</h3>
      </CardHeader>
      <CardContent className="p-2 -mt-6 text-xs space-y-2 h-full">
        {isDataAvailable ? (
          <Select onValueChange={handleYearChange}>
            <SelectTrigger className="w-[180px] cursor-pointer z-50">
              <SelectValue placeholder={selectedYear || "Select CII Year"} />
            </SelectTrigger>
            <SelectContent className="z-100 absolute">
              <SelectGroup>
                <SelectLabel>Select Year</SelectLabel>
                <SelectItem value="2021">2021</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        ) : null}

        {isDataAvailable ? (
          <>
            <div className="h-0.5 bg-black w-56 mx-auto my-4"></div>
            {renderCiiContent(ciiData)}

            <div className="h-0.5 bg-black w-56 mx-auto my-3"></div>

            {renderCiiContent(ciiDataRating)}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 h-full">
            <Database className="text-gray-400" size={40} />
            <div className="text-sm text-gray-600">Data will appear here</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CiiValueCard;
