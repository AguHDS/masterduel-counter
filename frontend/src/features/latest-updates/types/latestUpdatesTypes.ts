export interface LatestUpdate {
  id: number;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLatestUpdateDTO {
  title: string;
  content: string;
}

export interface PaginatedLatestUpdates {
  posts: LatestUpdate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
