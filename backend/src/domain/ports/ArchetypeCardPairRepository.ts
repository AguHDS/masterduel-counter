import {
  ArchetypeCardPair,
  ArchetypeCardPairCreateDTO,
  ArchetypeCardPairWithDetails,
} from "../ArchetypeCardPair";

export interface ArchetypeCardPairRepository {
  /**
   * Crea múltiples pares de cartas para una instancia de arquetipo
   */
  createMany(pairs: ArchetypeCardPairCreateDTO[]): Promise<ArchetypeCardPair[]>;

  /**
   * Obtiene todos los pares de cartas de una instancia de arquetipo
   */
  findByInstanceId(instanceId: number): Promise<ArchetypeCardPair[]>;

  /**
   * Obtiene todos los pares de cartas de una instancia con detalles de las cartas
   */
  findByInstanceIdWithDetails(
    instanceId: number,
  ): Promise<ArchetypeCardPairWithDetails[]>;

  /**
   * Elimina todos los pares de cartas de una instancia
   */
  deleteByInstanceId(instanceId: number): Promise<void>;

  /**
   * Elimina un par específico
   */
  deleteById(id: number): Promise<void>;
}
