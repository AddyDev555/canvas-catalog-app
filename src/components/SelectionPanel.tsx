import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Artwork } from "@/types/artwork";

interface SelectionPanelProps {
  selectedRows: Map<number, Artwork>;
  onRemoveSelection: (id: number) => void;
  onClearAll: () => void;
}

export const SelectionPanel = ({
  selectedRows,
  onRemoveSelection,
  onClearAll,
}: SelectionPanelProps) => {
  const selectedCount = selectedRows.size;

  if (selectedCount === 0) return null;

  return (
    <Card className="p-6 mb-6 border-primary/20 bg-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Selected Artworks ({selectedCount})
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearAll}
          className="text-muted-foreground hover:text-foreground"
        >
          Clear All
        </Button>
      </div>
      <div className="grid gap-2 max-h-64 overflow-y-auto">
        {Array.from(selectedRows.values()).map((artwork) => (
          <div
            key={artwork.id}
            className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {artwork.title || "Untitled"}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {artwork.artist_display || "Unknown Artist"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveSelection(artwork.id)}
              className="ml-2 h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};
