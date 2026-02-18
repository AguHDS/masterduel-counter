import "express";

declare module "express" {
  interface Request {
    validatedInstanceId?: number;
    validatedDeckData?: {
      instanceId: number;
      userId: string;
      title?: string;
      mainDeckCards: any[];
      extraDeckCards: any[];
    };
    validatedDeleteData?: {
      instanceId: number;
      userId: string;
    };
  }
}
