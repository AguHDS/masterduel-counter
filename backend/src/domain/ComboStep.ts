/** Represents a step in a combo flow for a deck guide initial hand */
export interface ComboStep {
  id: number;
  initialHandId: number;
  stepOrder: number;
  description: string | null;
  createdAt: string;
  mainCardIds: number[];
  subCardIds: number[];
  leftSubCardIds: number[];
}

export interface ComboStepCreateDTO {
  initialHandId: number;
  stepOrder: number;
  description?: string | null;
  mainCardIds: number[];
  subCardIds: number[];
  leftSubCardIds: number[];
}

export interface ComboStepWithCards extends Omit<ComboStep, 'mainCardIds' | 'subCardIds' | 'leftSubCardIds'> {
  mainCards: Array<{
    id: number;
    name: string;
    image_url: string;
    image_url_small: string;
    image_url_cropped: string;
  }>;
  subCards: Array<{
    id: number;
    name: string;
    image_url: string;
    image_url_small: string;
    image_url_cropped: string;
  }>;
  leftSubCards: Array<{
    id: number;
    name: string;
    image_url: string;
    image_url_small: string;
    image_url_cropped: string;
  }>;
}
