import { ArchetypeServicePort } from "@/application/ports/ArchetypeService";
import { ArchetypeRepository } from "@/domain/ports/ArchetypeRepository";
import { ArchetypeCardPairRepository } from "@/domain/ports/ArchetypeCardPairRepository";
import { CardService } from "@/application/ports/CardService";
import {
  Archetype,
  ArchetypeCreateDTO,
  ArchetypeUpdateDTO,
  ArchetypeRequestDTO,
  ArchetypeRequestResponse,
} from "@/domain/Archetype";

export class ArchetypeService implements ArchetypeServicePort {
  private repository: ArchetypeRepository;
  private cardPairRepository: ArchetypeCardPairRepository;
  private cardService: CardService;

  constructor(
    repository: ArchetypeRepository,
    cardPairRepository: ArchetypeCardPairRepository,
    cardService: CardService,
  ) {
    this.repository = repository;
    this.cardPairRepository = cardPairRepository;
    this.cardService = cardService;
  }

  async searchArchetypes(
    searchTerm: string,
    limit: number = 50,
  ): Promise<Archetype[]> {
    if (!searchTerm || searchTerm.trim() === "") {
      return [];
    }

    const trimmedTerm = searchTerm.trim();

    if (trimmedTerm.length < 3) {
      return this.repository.searchAutocomplete(trimmedTerm, limit);
    }

    return this.repository.searchByName(trimmedTerm, limit);
  }

  async getArchetypeById(id: number): Promise<Archetype | null> {
    if (!id || id <= 0) {
      throw new Error("ID inválido");
    }

    return this.repository.findById(id);
  }

  async getArchetypeByName(name: string): Promise<Archetype | null> {
    if (!name || name.trim() === "") {
      throw new Error("Nombre inválido");
    }

    return this.repository.findByName(name.trim());
  }

  async createArchetype(archetypeData: ArchetypeCreateDTO): Promise<Archetype> {
    if (!archetypeData.name || archetypeData.name.trim() === "") {
      throw new Error("El nombre del arquetipo es requerido");
    }

    const name = archetypeData.name.trim();
    const exists = await this.repository.existsByName(name);

    if (exists) {
      throw new Error(`Ya existe un arquetipo con el nombre "${name}"`);
    }

    return this.repository.create({
      ...archetypeData,
      name,
      registered: archetypeData.registered ?? false,
      pending_requests: archetypeData.pending_requests ?? 0,
    });
  }

  async requestArchetypeRegistration(
    requestData: ArchetypeRequestDTO,
  ): Promise<ArchetypeRequestResponse> {
    let archetype: Archetype | null = null;

    if (requestData.archetype_id) {
      archetype = await this.getArchetypeById(requestData.archetype_id);
    } else if (requestData.archetype_name) {
      archetype = await this.getArchetypeByName(requestData.archetype_name);
    }

    if (!archetype) {
      throw new Error("Arquetipo no encontrado");
    }

    if (archetype.registered) {
      return {
        success: false,
        message: "Este arquetipo ya está registrado",
        archetype,
        current_requests: archetype.pending_requests,
      };
    }

    const updated = await this.repository.incrementPendingRequests(
      archetype.id,
    );

    if (!updated) {
      throw new Error("Error al procesar la solicitud");
    }

    return {
      success: true,
      message: `Solicitud registrada. Total de solicitudes: ${updated.pending_requests}`,
      archetype: updated,
      current_requests: updated.pending_requests,
    };
  }

  async approveArchetypeRegistration(id: number): Promise<Archetype | null> {
    if (!id || id <= 0) {
      throw new Error("ID inválido");
    }

    const result = await this.repository.markAsRegistered(id);

    if (!result) {
      throw new Error(`Arquetipo con ID ${id} no encontrado`);
    }

    return result;
  }

  async getPendingArchetypes(limit?: number): Promise<Archetype[]> {
    return this.repository.findWithPendingRequests(limit);
  }

  async clearPendingRequests(id: number): Promise<Archetype | null> {
    if (!id || id <= 0) {
      throw new Error("ID inválido");
    }

    const result = await this.repository.resetPendingRequests(id);

    if (!result) {
      throw new Error(`Arquetipo con ID ${id} no encontrado`);
    }

    return result;
  }

  async getStatistics(): Promise<{
    total: number;
    registered: number;
    unregistered: number;
    pending_requests_total: number;
    archetypes_with_requests: number;
  }> {
    return this.repository.getStatistics();
  }

  async advancedSearch(options: {
    searchTerm?: string;
    registered?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ results: Archetype[]; total: number }> {
    let results: Archetype[] = [];
    let total = 0;

    if (options.searchTerm) {
      results = await this.repository.searchByName(
        options.searchTerm,
        options.limit || 50,
      );
      const allResults = await this.repository.searchByName(
        options.searchTerm,
        10000,
      );
      total = allResults.length;
    } else {
      results = await this.repository.findAll(options.limit, options.offset);
      const allResults = await this.repository.findAll();
      total = allResults.length;
    }

    if (options.registered !== undefined) {
      results = results.filter(
        (archetype) => archetype.registered === options.registered,
      );
      total = results.length;
    }

    return { results, total };
  }

  async getAllArchetypes(
    limit?: number,
    offset?: number,
  ): Promise<Archetype[]> {
    return this.repository.findAll(limit, offset);
  }

  async updateArchetype(
    id: number,
    archetypeData: ArchetypeUpdateDTO,
  ): Promise<Archetype | null> {
    if (!id || id <= 0) {
      throw new Error("ID inválido");
    }

    const existing = await this.getArchetypeById(id);
    if (!existing) {
      throw new Error(`Arquetipo con ID ${id} no encontrado`);
    }

    if (archetypeData.name && archetypeData.name.trim() !== existing.name) {
      const newName = archetypeData.name.trim();
      const existingWithName = await this.repository.findByName(newName);

      if (existingWithName && existingWithName.id !== id) {
        throw new Error(`Ya existe un arquetipo con el nombre "${newName}"`);
      }

      archetypeData.name = newName;
    }

    return this.repository.update(id, archetypeData);
  }

  async markAsUnregistered(id: number): Promise<Archetype | null> {
    if (!id || id <= 0) {
      throw new Error("ID inválido");
    }

    const result = await this.repository.markAsUnregistered(id);

    if (!result) {
      throw new Error(`Arquetipo con ID ${id} no encontrado`);
    }

    return result;
  }

  async archetypeExists(name: string): Promise<boolean> {
    if (!name || name.trim() === "") {
      return false;
    }

    return this.repository.existsByName(name.trim());
  }

  async suggestArchetypes(
    partialName: string,
    limit: number = 10,
  ): Promise<Archetype[]> {
    if (!partialName || partialName.trim() === "") {
      return [];
    }

    const trimmedTerm = partialName.trim();
    return this.repository.searchAutocomplete(trimmedTerm, limit);
  }
}
