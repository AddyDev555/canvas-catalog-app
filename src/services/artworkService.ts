import { ArtworkResponse } from "@/types/artwork";

const API_BASE_URL = "https://api.artic.edu/api/v1/artworks";

export const fetchArtworks = async (page: number = 1): Promise<ArtworkResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}?page=${page}`);
    if (!response.ok) {
      throw new Error("Failed to fetch artworks");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching artworks:", error);
    throw error;
  }
};
