import {
  ArchetypeCardPair,
  ArchetypeCardPairCreateDTO,
  ArchetypeCardPairWithDetails,
} from "../ArchetypeCardPair";

export interface ArchetypeCardPairRepository {
  /**
   * Crea múltiples pares de cartas para un arquetipo
   */
  createMany(pairs: ArchetypeCardPairCreateDTO[]): Promise<ArchetypeCardPair[]>;

  /**
   * Obtiene todos los pares de cartas de un arquetipo
   */
  findByArchetypeId(archetypeId: number): Promise<ArchetypeCardPair[]>;

  /**
   * Obtiene todos los pares de cartas de un arquetipo con detalles de las cartas
   */
  findByArchetypeIdWithDetails(
    archetypeId: number,
  ): Promise<ArchetypeCardPairWithDetails[]>;

  /**
   * Elimina todos los pares de cartas de un arquetipo
   */
  deleteByArchetypeId(archetypeId: number): Promise<void>;

  /**
   * Elimina un par específico
   */
  deleteById(id: number): Promise<void>;
}
