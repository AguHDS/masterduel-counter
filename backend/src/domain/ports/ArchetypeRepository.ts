import { Archetype, ArchetypeCreateDTO, ArchetypeUpdateDTO } from "../Archetype";

export interface ArchetypeRepository {
  /** archetype by name
   * @searchTerm - Term to search for in archetype names
   * @limit - Maximum number of results to return (default: 50)
   */
  searchArchetypeByName(searchTerm: string, limit?: number): Promise<Archetype[]>;
  searchAutocomplete(searchTerm: string, limit?: number): Promise<Archetype[]>;
  /** Find Archetype by its ID */
  findById(id: number): Promise<Archetype | null>;
  findByName(name: string): Promise<Archetype | null>;
  findAll(limit?: number, offset?: number): Promise<Archetype[]>;
  findAllRegistered(): Promise<Archetype[]>;
  create(archetypeData: ArchetypeCreateDTO): Promise<Archetype>;
  update(id: number, archetypeData: ArchetypeUpdateDTO): Promise<Archetype | null>;
  markAsRegistered(id: number, userId?: string): Promise<Archetype | null>;
  incrementPendingRequests(id: number): Promise<Archetype | null>;
  decrementPendingRequests(id: number): Promise<Archetype | null>;
  resetPendingRequests(id: number): Promise<Archetype | null>;
  findWithPendingRequests(limit?: number): Promise<Archetype[]>;

  existsByName(name: string): Promise<boolean>;
}