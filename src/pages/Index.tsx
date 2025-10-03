import { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Artwork } from "@/types/artwork";
import { fetchArtworks } from "@/services/artworkService";
import { SelectionPanel } from "@/components/SelectionPanel";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import "primereact/resources/themes/lara-light-amber/theme.css";
import "primeicons/primeicons.css";

const Index = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>([]);
  const [selectedRows, setSelectedRows] = useState<Map<number, Artwork>>(new Map());
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const loadArtworks = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetchArtworks(page);
      setArtworks(response.data);
      setFilteredArtworks(response.data);
      setTotalRecords(response.pagination.total);
      setCurrentPage(page);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load artworks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArtworks(1);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredArtworks(artworks);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = artworks.filter((artwork) => {
        return (
          artwork.title?.toLowerCase().includes(query) ||
          artwork.artist_display?.toLowerCase().includes(query) ||
          artwork.place_of_origin?.toLowerCase().includes(query) ||
          artwork.inscriptions?.toLowerCase().includes(query)
        );
      });
      setFilteredArtworks(filtered);
    }
  }, [searchQuery, artworks]);

  const onPageChange = (event: any) => {
    const newPage = event.page + 1;
    loadArtworks(newPage);
    setSearchQuery(""); // Reset search when changing pages
  };

  const onSelectionChange = (e: any) => {
    const newSelectedRows = new Map(selectedRows);
    
    if (Array.isArray(e.value)) {
      // Get current selection from e.value
      const currentSelection = new Set(e.value.map((art: Artwork) => art.id));
      const currentPageIds = filteredArtworks.map(art => art.id);
      
      // Check each row on current page
      currentPageIds.forEach(id => {
        const artwork = filteredArtworks.find(art => art.id === id);
        if (currentSelection.has(id)) {
          // Row is selected in e.value, add it to map
          if (artwork) {
            newSelectedRows.set(id, artwork);
          }
        } else {
          // Row is not selected in e.value, remove it from map
          newSelectedRows.delete(id);
        }
      });
    }
    
    setSelectedRows(newSelectedRows);
  };

  const handleRemoveSelection = (id: number) => {
    const newSelectedRows = new Map(selectedRows);
    newSelectedRows.delete(id);
    setSelectedRows(newSelectedRows);
  };

  const handleClearAll = () => {
    setSelectedRows(new Map());
  };

  // Get currently visible selected rows for the DataTable
  const currentPageSelectedRows = filteredArtworks.filter(art => 
    selectedRows.has(art.id)
  );

  return (
    <div className="min-h-screen bg-background p-8">
      <style>{`
        .p-datatable .p-datatable-tbody > tr.p-highlight {
          background-color: #86efac !important;
          color: #166534 !important;
        }
        
        .p-datatable .p-datatable-tbody > tr.p-highlight:hover {
          background-color: #4ade80 !important;
        }
        
        .p-checkbox .p-checkbox-box.p-highlight {
          border-color: #22c55e !important;
          background: #22c55e !important;
        }
        
        .p-checkbox:not(.p-checkbox-disabled) .p-checkbox-box.p-highlight:hover {
          border-color: #16a34a !important;
          background: #16a34a !important;
        }
        
        .p-checkbox .p-checkbox-box.p-focus {
          border-color: #22c55e !important;
          box-shadow: 0 0 0 0.2rem rgba(34, 197, 94, 0.25) !important;
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Art Institute of Chicago
          </h1>
          <p className="text-muted-foreground">
            Browse and explore the museum's collection
          </p>
        </header>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by title, artist, origin, or inscriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>

        <SelectionPanel
          selectedRows={selectedRows}
          onRemoveSelection={handleRemoveSelection}
          onClearAll={handleClearAll}
        />

        <div className="bg-card rounded-lg shadow-lg overflow-hidden border border-border">
          <DataTable
            value={filteredArtworks}
            loading={loading}
            paginator
            rows={12}
            totalRecords={totalRecords}
            lazy
            onPage={onPageChange}
            first={(currentPage - 1) * 12}
            selection={currentPageSelectedRows as any}
            onSelectionChange={onSelectionChange}
            dataKey="id"
            className="artwork-table"
            emptyMessage="No artworks found"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} artworks"
          >
            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
            <Column
              field="title"
              header="Title"
              style={{ minWidth: '250px' }}
              body={(rowData) => rowData.title || "Untitled"}
            />
            <Column
              field="place_of_origin"
              header="Origin"
              style={{ minWidth: '150px' }}
              body={(rowData) => rowData.place_of_origin || "Unknown"}
            />
            <Column
              field="artist_display"
              header="Artist"
              style={{ minWidth: '200px' }}
              body={(rowData) => rowData.artist_display || "Unknown Artist"}
            />
            <Column
              field="inscriptions"
              header="Inscriptions"
              style={{ minWidth: '200px' }}
              body={(rowData) => rowData.inscriptions || "—"}
            />
            <Column
              field="date_start"
              header="Date Start"
              style={{ minWidth: '120px' }}
              body={(rowData) => rowData.date_start || "—"}
            />
            <Column
              field="date_end"
              header="Date End"
              style={{ minWidth: '120px' }}
              body={(rowData) => rowData.date_end || "—"}
            />
          </DataTable>
        </div>
      </div>
    </div>
  );
};

export default Index;