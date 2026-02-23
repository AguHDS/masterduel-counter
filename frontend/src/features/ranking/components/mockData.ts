export interface RankingUser {
  id: number;
  rank: number;
  username: string;
  avatarUrl: string;
  points: number;
}

export const MOCK_RANKING_USERS: RankingUser[] = [
  {
    id: 1,
    rank: 1,
    username: "DuelMaster",
    avatarUrl: "https://i.pravatar.cc/150?img=1",
    points: 9850,
  },
  {
    id: 2,
    rank: 2,
    username: "CardSlinger",
    avatarUrl: "https://i.pravatar.cc/150?img=2",
    points: 8720,
  },
  {
    id: 3,
    rank: 3,
    username: "YamiYugi",
    avatarUrl: "https://i.pravatar.cc/150?img=3",
    points: 7640,
  },
  {
    id: 4,
    rank: 4,
    username: "BlueEyesDragon",
    avatarUrl: "https://i.pravatar.cc/150?img=4",
    points: 6530,
  },
  {
    id: 5,
    rank: 5,
    username: "DarkMagician",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
    points: 5420,
  },
  {
    id: 6,
    rank: 6,
    username: "ExodiaFTK",
    avatarUrl: "https://i.pravatar.cc/150?img=6",
    points: 4310,
  },
];

export const getRankStyles = (rank: number) => {
  switch (rank) {
    case 1:
      return {
        bg: "bg-gradient-to-r from-yellow-500/20 to-amber-600/20",
        border: "border-yellow-500/30",
        text: "text-yellow-400",
        icon: "text-yellow-400",
      };
    case 2:
      return {
        bg: "bg-gradient-to-r from-gray-400/20 to-gray-500/20",
        border: "border-gray-400/30",
        text: "text-gray-300",
        icon: "text-gray-400",
      };
    case 3:
      return {
        bg: "bg-gradient-to-r from-amber-700/20 to-amber-800/20",
        border: "border-amber-700/30",
        text: "text-amber-600",
        icon: "text-amber-700",
      };
    default:
      return {
        bg: "bg-blue-950/30",
        border: "border-blue-800/30",
        text: "text-blue-300",
        icon: "text-blue-400",
      };
  }
};
