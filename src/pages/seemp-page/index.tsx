import axios from "axios";
import { FC, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { Search } from "lucide-react";
import ShipInfoCard from "./components/ship-info-card";
import { VITE_BACKEND_URI } from "../../lib/env";
import { MarkerData } from "../../components/common/map";
import MapComponent from "../../components/common/map";
import { AnnualCIIWithDDVector } from "./components/cii-value-card";
import CiiValueCard from "./components/cii-value-card";
import SEEMPChart from "./components/seemp-chart";
import SeempTable from "./components/seemp-table";
import { ISeempTableProps } from "./components/seemp-table";
import { Button } from "../../components/ui/button";
import { Seemp } from "../../types/seemp";

import { ShipData } from "./components/ship-info-card";

const SEEMPPage: FC = () => {
  const [shipData, setShipData] = useState<MarkerData[]>([]);
  const [shipDetail, setShipDetail] = useState<ShipData | null>(null);
  const [ciiData, setCiiData] = useState<AnnualCIIWithDDVector[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredShips, setFilteredShips] = useState<MarkerData[]>([]);
  const [selectedMmsi, setSelectedMmsi] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [seempData, setSeempData] = useState<ISeempTableProps | null>(null);
  const location = useLocation();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [currentItems, setCurrentItems] = useState<Seemp[] | null>(null);
  const navigate = useNavigate();

  const toggleTableVisibility = () => {
    setShowTable((prev) => !prev);
  };

  // Initialize filteredShips when shipData changes
  useEffect(() => {
    setFilteredShips(shipData);
  }, [shipData]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const mmsiParam = urlParams.get("mmsi");
    const pageParam = urlParams.get("page");

    if (mmsiParam) {
      setSelectedMmsi(mmsiParam);
    }

    const pageNumber = pageParam ? Number(pageParam) : 1;
    setCurrentPage(pageNumber);

    const indexOfLastItem = pageNumber * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    if (seempData?.data) {
      const paginatedData = seempData.data.slice(
        indexOfFirstItem,
        indexOfLastItem
      );
      setCurrentItems(paginatedData);
    } else {
      setCurrentItems(null);
    }

    window.scrollTo(0, 0);
  }, [location.search, itemsPerPage, seempData?.data]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const mmsiParam = urlParams.get("mmsi");
    if (mmsiParam) {
      setSelectedMmsi(mmsiParam);
    }
  }, [location.search]);

  useEffect(() => {
    if (!selectedMmsi) return setShipDetail(null);
    const fetchDetails = async () => {
      try {
        const { data } = await axios.get(
          `${VITE_BACKEND_URI}/ships/data/secondary/mmsi/${selectedMmsi}`
        );
        setShipDetail(data.data);
      } catch (error) {
        console.error("Error fetching ship detail:", error);
      }
    };
    fetchDetails();
  }, [selectedMmsi]);

  useEffect(() => {
    if (!selectedMmsi) return setCiiData([]);
    const fetchDetails = async () => {
      try {
        const { data } = await axios.get(
          `${VITE_BACKEND_URI}/cii/annual/${selectedMmsi}/ddvector`
        );
        setCiiData(data.data);
      } catch (error) {
        setCiiData([]);
        console.error("Error fetching CII data:", error);
      }
    };
    fetchDetails();
  }, [selectedMmsi]);

  useEffect(() => {
    if (!selectedMmsi) return setSeempData(null);
    const fetchSeempData = async () => {
      try {
        const { data } = await axios.get(
          `${VITE_BACKEND_URI}/seemp/${selectedMmsi}`
        );
        setSeempData(data);
      } catch (error) {
        setSeempData(null);
        console.error("Error fetching SEEMP data:", error);
      }
    };
    fetchSeempData();
  }, [selectedMmsi]);

  // Fixed search function
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredShips([]);
    } else {
      const searchTerm = query.trim();
      const filtered = shipData.filter((ship) => {
        // Exact match first priority
        if (ship.mmsi === searchTerm) {
          return true;
        }
        // Then starts with match
        return ship.mmsi.startsWith(searchTerm);
      });
      
      // Sort results: exact match first, then by MMSI order
      filtered.sort((a, b) => {
        if (a.mmsi === searchTerm) return -1;
        if (b.mmsi === searchTerm) return 1;
        return a.mmsi.localeCompare(b.mmsi);
      });
      
      setFilteredShips(filtered);
    }
  };

  const handleShipClick = (mmsi: string) => {
    navigate(`?mmsi=${mmsi}`);
    setSearchQuery("");
    setFilteredShips([]);
  };

  const handleInputBlur = () => {
  
    setTimeout(() => {
      setFilteredShips([]);
    }, 200);
  };

  useEffect(() => {
    const fetchShipData = async () => {
      try {
        const response = await axios.get(`${VITE_BACKEND_URI}/ais`);
        setShipData(response.data.data);
      } catch (error) {
        console.error("Error fetching ship data:", error);
      }
    };

    fetchShipData();
  }, []);

  const totalPages =
    seempData?.data && seempData.data.length
      ? Math.ceil(seempData.data.length / itemsPerPage)
      : 1;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const indexOfLastItem = page * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    if (seempData?.data) {
      const paginatedData = seempData.data.slice(
        indexOfFirstItem,
        indexOfLastItem
      );
      setCurrentItems(paginatedData);
    }

    // Update URL with page parameter
    const params = new URLSearchParams(location.search);
    if (selectedMmsi) {
      params.set('mmsi', selectedMmsi);
    }
    params.set('page', page.toString());
    navigate(`?${params.toString()}`, { replace: true });
  };

  return (
    <main className="h-screen w-screen relative bg-gray-300 overflow-hidden z-1">
      <aside className="absolute top-0 right-0 z-100 w-7/20 h-full bg-slate-300 p-3 rounded-l-xl">
        <div className="mb-2 mr-16 relative mt-2">
          <Input
            placeholder="Search ships by MMSI..."
            className="w-full p-1 rounded-md border border-gray-400 bg-white pl-8 text-xs"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onBlur={handleInputBlur}
            onFocus={() => {
              // Show results again if there's a search query
              if (searchQuery.trim()) {
                handleSearch(searchQuery);
              }
            }}
          />
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
            <Search className="text-gray-600" size={16} />
          </div>
          {searchQuery.trim() && filteredShips.length > 0 && (
            <div className="mt-2 bg-white border rounded-md shadow-lg text-sm max-h-40 overflow-y-auto absolute z-999 w-full">
              {filteredShips.map((ship) => (
                <div
                  key={ship.mmsi}
                  className="block px-3 py-1 hover:bg-gray-200 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleShipClick(ship.mmsi)}
                  onMouseDown={(e) => e.preventDefault()} 
                >
                  <div className="font-medium">{ship.mmsi}</div>
                </div>
              ))}
            </div>
          )}
          {searchQuery.trim() && filteredShips.length === 0 && (
            <div className="mt-2 bg-white border rounded-md shadow-lg text-sm p-3 absolute z-999 w-full">
              <div className="text-gray-500">No ships found matching "{searchQuery}"</div>
            </div>
          )}
        </div>

        <div className="grid grid-rows-9 gap-4 mb-4 mr-16 h-[90vh]">
          <ShipInfoCard shipData={shipDetail} />
          <div className="grid grid-cols-2 gap-2 row-span-4">
            <CiiValueCard ciis={ciiData || []} />
            <SEEMPChart
              ciis={ciiData || []}
              showTable={showTable}
              toggleTableVisibility={toggleTableVisibility}
            />
          </div>
        </div>
      </aside>

      <MapComponent
        markers={shipData}
        selectedMmsi={selectedMmsi}
        setSelectedMmsi={setSelectedMmsi}
      />
      {showTable && (
        <section className="h-64 absolute bottom-0 w-13/20 z-100 left-0 bg-slate-300 p-3 text-xs pl-5">
          <SeempTable data={currentItems} pageCount={totalPages} />
        </section>
      )}
      {showTable && (
        <div className="absolute bottom-4 left-4 bg-white p-2 rounded-md shadow-lg flex items-center gap-2 z-110">
          <Button
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            size="sm"
          >
            Prev
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            size="sm"
          >
            Next
          </Button>
        </div>
      )}
    </main>
  );
};

export default SEEMPPage;