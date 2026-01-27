import { Archetype, ArchetypeCreateDTO, ArchetypeUpdateDTO, ArchetypeWithHeaderCard } from "../Archetype";

export interface ArchetypeRepository {
  searchByName(searchTerm: string, limit?: number): Promise<Archetype[]>;
  searchAutocomplete(searchTerm: string, limit?: number): Promise<Archetype[]>;
  findById(id: number): Promise<Archetype | null>;
  findByIdWithHeaderCard(id: number): Promise<ArchetypeWithHeaderCard | null>;
  findByName(name: string): Promise<Archetype | null>;
  findAll(limit?: number, offset?: number): Promise<Archetype[]>;
  create(archetypeData: ArchetypeCreateDTO): Promise<Archetype>;
  update(id: number, archetypeData: ArchetypeUpdateDTO): Promise<Archetype | null>;
  markAsRegistered(id: number): Promise<Archetype | null>;
  markAsUnregistered(id: number): Promise<Archetype | null>;
  incrementPendingRequests(id: number): Promise<Archetype | null>;
  decrementPendingRequests(id: number): Promise<Archetype | null>;
  resetPendingRequests(id: number): Promise<Archetype | null>;
  findWithPendingRequests(limit?: number): Promise<Archetype[]>;
  getStatistics(): Promise<{
    total: number;
    registered: number;
    unregistered: number;
    pending_requests_total: number;
    archetypes_with_requests: number;
  }>;
  existsByName(name: string): Promise<boolean>;
}