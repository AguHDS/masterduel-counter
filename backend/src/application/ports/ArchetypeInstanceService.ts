import {
  ArchetypeInstance,
  ArchetypeInstanceCreateDTO,
  ArchetypeInstanceUpdateDTO,
  ArchetypeInstanceWithDetails,
} from "../../domain/ArchetypeInstance";

export interface ArchetypeInstanceServicePort {
  /** Crea una nueva instancia o actualiza si ya existe para el usuario */
  createOrUpdateInstance(data: ArchetypeInstanceCreateDTO): Promise<ArchetypeInstance>;
  
  /** Obtiene una instancia por su ID */
  getInstanceById(id: number): Promise<ArchetypeInstance | null>;
  
  /** Obtiene todas las instancias creadas para un arquetipo específico */
  getInstancesByArchetypeId(archetypeId: number): Promise<ArchetypeInstanceWithDetails[]>;
  
  /** Obtiene todas las instancias creadas por un usuario */
  getInstancesByUserId(userId: string): Promise<ArchetypeInstanceWithDetails[]>;
  
  /** Actualiza una instancia existente */
  updateInstance(id: number, userId: string, data: ArchetypeInstanceUpdateDTO): Promise<ArchetypeInstance>;
  
  /** Elimina una instancia del usuario */
  deleteInstance(id: number, userId: string): Promise<void>;
}
