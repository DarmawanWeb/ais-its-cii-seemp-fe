import { AlertTriangle } from "lucide-react";
export default function DataNotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center text-gray-600  gap-2 h-full">
      <AlertTriangle className="w-6 h-6 text-yellow-500" />
      <span className="text-sm font-medium">Ships Data not found</span>
    </div>
  );
}
