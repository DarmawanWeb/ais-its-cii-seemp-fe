import IllegalLogCard from "./illegal-log-card";
import { IllegalLog } from "./data-illegal-log";
import { X } from "lucide-react";

export default function IllegalLogSidebar({
  logs,
  onClear,
}: {
  logs: IllegalLog[];
  onClear: () => void;
}) {
  return (
    <div className="w-full h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-2xl flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-linier-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950">
        <div>
          <h3 className="font-bold text-base text-gray-900 dark:text-white">
            Illegal Fishing Log
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {logs.length} kapal dalam radius
          </p>
        </div>
        <button
          onClick={onClear}
          className="p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Tidak ada kapal dalam radius
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Klik pada peta atau zoom out untuk mencari area lain
            </p>
          </div>
        ) : (
          logs.map((log) => (
            <IllegalLogCard key={log.id} log={log} />
          ))
        )}
      </div>

      {/* Footer */}
      {logs.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <button
            onClick={onClear}
            className="w-full bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors shadow-md"
          >
            Tutup & Reset Pilihan
          </button>
        </div>
      )}
    </div>
  );
}