import { useQuery } from "@tanstack/react-query";

interface LatestGuide {
  id: number;
  archetypeId: number;
  archetypeName: string;
  title: string;
  userName: string;
  headerCardImageUrl?: string;
  headerCardName?: string;
  createdAt: string;
  views: number;
  likes: number;
  favorites?: number;
}

const mockGuides: LatestGuide[] = [
  {
    id: 1,
    archetypeId: 1,
    archetypeName: "Kashtira",
    title: "Kashtira Counter Guide",
    userName: "PonyRosa",
    headerCardImageUrl: "",
    headerCardName: "Kashtira Fenrir",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    views: 1250,
    likes: 87,
    favorites: 45,
  },
  {
    id: 2,
    archetypeId: 2,
    archetypeName: "Labrynth",
    title: "Labrynth Counter Guide",
    userName: "PonyRosa",
    headerCardImageUrl: "",
    headerCardName: "Lady Labrynth",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    views: 2100,
    likes: 134,
    favorites: 78,
  },
  {
    id: 3,
    archetypeId: 3,
    archetypeName: "Purrely",
    title: "Purrely Counter Guide",
    userName: "PonyRosa",
    headerCardImageUrl: "",
    headerCardName: "Purrely",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    views: 1870,
    likes: 102,
    favorites: 56,
  },
  {
    id: 4,
    archetypeId: 4,
    archetypeName: "Snake-Eye",
    title: "Snake-Eye Counter Guide",
    userName: "YugiMaster",
    headerCardImageUrl: "",
    headerCardName: "Snake-Eye Ash",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    views: 3200,
    likes: 215,
    favorites: 134,
  },
  {
    id: 5,
    archetypeId: 5,
    archetypeName: "Rescue-Ace",
    title: "Rescue-Ace Counter Guide",
    userName: "DeckBuilder",
    headerCardImageUrl: "",
    headerCardName: "Rescue-Ace Hydrant",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    views: 1950,
    likes: 145,
    favorites: 89,
  },
];

export const useLatestCreatedGuides = (limit: number = 5) => {
  return useQuery({
    queryKey: ["latestCreatedGuides", limit],
    queryFn: async (): Promise<LatestGuide[]> => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockGuides.slice(0, limit);
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};
