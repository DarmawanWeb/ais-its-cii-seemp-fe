  import { IllegalLog } from "./data-illegal-log";
  import { Card } from "../../../components/ui/card";
  import { Ship, Calendar, Users, AlertTriangle, MapPin } from "lucide-react";

  export default function IllegalLogCard({ log }: { log: IllegalLog }) {
    const date = new Date(log.tgl_riksa);
    const hasValidDate = Boolean(log.tgl_riksa) && !Number.isNaN(date.getTime());
    const crewMissing =
      (log.jumlah_awak_wni ?? 0) === 0 && (log.jumlah_awak_wna ?? 0) === 0;

    return (
      <Card className="p-1.5 border-l-4 border-l-red-500 hover:shadow transition-shadow bg-white dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center gap-1 mb-0.5">
          <Ship className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
              {log.nama_kapal}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              GT {log.gt} • {log.kebangsaan}
            </p>
          </div>
        </div>

        {/* Location & Date */}
        <div className="grid grid-cols-2 gap-1 mb-0.5">
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-xs min-w-0">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{log.perairan}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-xs min-w-0">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {hasValidDate
                ? date.toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "2-digit",
                  })
                : "-"}
            </span>
          </div>
        </div>

        {/* Violation Box */}
        <div className="mb-0.5 p-1 bg-red-50 dark:bg-red-950/30 rounded border border-red-200 dark:border-red-900">
          <div className="flex items-start gap-1">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-red-900 dark:text-red-200">
                Pelanggaran
              </p>
              <p className="text-xs text-red-700 dark:text-red-300 leading-tight line-clamp-1 truncate">
                {log.duga_langgar}
              </p>
            </div>
          </div>
        </div>

        {/* Crew Info */}
        <div className="flex items-center gap-2 mb-0.5 min-w-0">
          {crewMissing ? (
            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
              <Users className="w-3.5 h-3.5" />
              <span className="truncate">-</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <Users className="w-3.5 h-3.5" />
                <span className="truncate">
                  WNI: <strong>{log.jumlah_awak_wni}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <Users className="w-3.5 h-3.5" />
                <span className="truncate">
                  WNA: <strong>{log.jumlah_awak_wna}</strong>
                </span>
              </div>
            </>
          )}
        </div>
        {/* Follow Up */}
        <div className="text-xs truncate min-w-0">
          <span className="font-medium text-gray-900 dark:text-white">
            {log.tindak_lanjut}
          </span>
          {log.keterangan && (
            <span className="text-gray-500 italic ml-1 truncate">
              ({log.keterangan})
            </span>
          )}
        </div>

        {/* Coordinates */}
        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono truncate">
          {log.lintang.toFixed(4)}°, {log.bujur.toFixed(4)}°
        </p>
      </Card>
    );
  }
