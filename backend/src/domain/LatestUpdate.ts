export interface LatestUpdate {
  id: number;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LatestUpdateWithAuthor extends LatestUpdate {
  authorName: string;
}

export interface CreateLatestUpdateDTO {
  title: string;
  content: string;
  authorId: string;
}

export interface UpdateLatestUpdateDTO {
  title?: string;
  content?: string;
}
