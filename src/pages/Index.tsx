import { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Artwork } from "@/types/artwork";
import { fetchArtworks } from "@/services/artworkService";
import { SelectionPanel } from "@/components/SelectionPanel";
import { useToast } from "@/hooks/use-toast";
import "primereact/resources/themes/lara-light-amber/theme.css";
import "primeicons/primeicons.css";

const Index = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedRows, setSelectedRows] = useState<Map<number, Artwork>>(new Map());
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const loadArtworks = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetchArtworks(page);
      setArtworks(response.data);
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

  const onPageChange = (event: any) => {
    const newPage = event.page + 1;
    loadArtworks(newPage);
  };

  const onSelectionChange = (e: any) => {
    const newSelectedRows = new Map(selectedRows);
    
    if (Array.isArray(e.value)) {
      // Handle "select all" on current page
      const currentPageIds = new Set(artworks.map(art => art.id));
      
      if (e.value.length === artworks.length) {
        // All rows on current page selected - add them
        e.value.forEach((artwork: Artwork) => {
          newSelectedRows.set(artwork.id, artwork);
        });
      } else {
        // Deselect all on current page
        currentPageIds.forEach(id => {
          newSelectedRows.delete(id);
        });
      }
    }
    
    setSelectedRows(newSelectedRows);
  };

  const onRowSelect = (e: any) => {
    const newSelectedRows = new Map(selectedRows);
    newSelectedRows.set(e.data.id, e.data);
    setSelectedRows(newSelectedRows);
  };

  const onRowUnselect = (e: any) => {
    const newSelectedRows = new Map(selectedRows);
    newSelectedRows.delete(e.data.id);
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
  const currentPageSelectedRows = artworks.filter(art => 
    selectedRows.has(art.id)
  );

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Art Institute of Chicago
          </h1>
          <p className="text-muted-foreground">
            Browse and explore the museum's collection
          </p>
        </header>

        <SelectionPanel
          selectedRows={selectedRows}
          onRemoveSelection={handleRemoveSelection}
          onClearAll={handleClearAll}
        />

        <div className="bg-card rounded-lg shadow-lg overflow-hidden border border-border">
          <DataTable
            value={artworks}
            loading={loading}
            paginator
            rows={12}
            totalRecords={totalRecords}
            lazy
            onPage={onPageChange}
            first={(currentPage - 1) * 12}
            selection={currentPageSelectedRows as any}
            onSelectionChange={onSelectionChange}
            onRowSelect={onRowSelect}
            onRowUnselect={onRowUnselect}
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
