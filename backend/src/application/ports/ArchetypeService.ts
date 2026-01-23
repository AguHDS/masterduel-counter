import {
  Archetype,
  ArchetypeUpdateDTO,
  ArchetypeRequestDTO,
  ArchetypeRequestResponse,
  ArchetypeCreateDTO,
} from "@/domain/Archetype";

export interface ArchetypeServicePort {
  searchArchetypes(searchTerm: string, limit?: number): Promise<Archetype[]>;
  getArchetypeById(id: number): Promise<Archetype | null>;
  getArchetypeByName(name: string): Promise<Archetype | null>;
  requestArchetypeRegistration(
    requestData: ArchetypeRequestDTO,
  ): Promise<ArchetypeRequestResponse>;
  approveArchetypeRegistration(id: number): Promise<Archetype | null>;
  getPendingArchetypes(limit?: number): Promise<Archetype[]>;
  clearPendingRequests(id: number): Promise<Archetype | null>;
  getStatistics(): Promise<{
    total: number;
    registered: number;
    unregistered: number;
    pending_requests_total: number;
    archetypes_with_requests: number;
  }>;
  advancedSearch(options: {
    searchTerm?: string;
    registered?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ results: Archetype[]; total: number }>;
  getAllArchetypes(limit?: number, offset?: number): Promise<Archetype[]>;
  createArchetype(archetypeData: ArchetypeCreateDTO): Promise<Archetype>;
  updateArchetype(
    id: number,
    archetypeData: ArchetypeUpdateDTO,
  ): Promise<Archetype | null>;
  markAsUnregistered(id: number): Promise<Archetype | null>;
  archetypeExists(name: string): Promise<boolean>;
  suggestArchetypes(partialName: string, limit?: number): Promise<Archetype[]>;
}
