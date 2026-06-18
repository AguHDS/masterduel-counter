/** Represents a step in a combo flow for a deck guide initial hand */
export interface ComboStep {
  id: number;
  initialHandId: number;
  stepOrder: number;
  description: string | null;
  parentCanceledStepId: number | null;
  stepType: string | null;
  leftScaleValue: number | null;
  rightScaleValue: number | null;
  createdAt: string;
  mainCardIds: number[];
  subCardIds: number[];
  leftSubCardIds: number[];
}

export interface ComboStepCreateDTO {
  initialHandId: number;
  stepOrder: number;
  description?: string | null;
  parentCanceledStepId?: number | null;
  mainCardIds: number[];
  mainCardChains?: (number | null)[];
  subCardIds: number[];
  subCardChains?: (number | null)[];
  leftSubCardIds: number[];
  leftSubCardChains?: (number | null)[];
  stepType?: string | null;
  leftScaleValue?: number | null;
  rightScaleValue?: number | null;
}

export interface ComboStepWithCards extends Omit<ComboStep, 'mainCardIds' | 'subCardIds' | 'leftSubCardIds'> {
  stepType: string | null;
  leftScaleValue: number | null;
  rightScaleValue: number | null;
  mainCards: Array<{
    id: number;
    name: string;
    image_url: string;
    image_url_small: string;
    image_url_cropped: string;
    chain_number: number | null;
  }>;
  subCards: Array<{
    id: number;
    name: string;
    image_url: string;
    image_url_small: string;
    image_url_cropped: string;
    chain_number: number | null;
  }>;
  leftSubCards: Array<{
    id: number;
    name: string;
    image_url: string;
    image_url_small: string;
    image_url_cropped: string;
    chain_number: number | null;
  }>;
}
