import { ArchetypeRepository } from "@/repositories/ArchetypeRepository";
import {
  Archetype,
  ArchetypeUpdateDTO,
  ArchetypeRequestDTO,
  ArchetypeRequestResponse,
} from "@/domain/Archetype";
import Database from "better-sqlite3";
import path from "path";

export class ArchetypeService {
  private repository: ArchetypeRepository;

  constructor(db?: Database.Database) {
    const database = db || this.createDatabaseConnection();
    this.repository = new ArchetypeRepository(database);
  }

  private createDatabaseConnection(): Database.Database {
    const dbPath = path.join(__dirname, "../../../src/data/database.db");
    return new Database(dbPath);
  }

  /**
   * Busca arquetipos por término de búsqueda
   */
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

  /**
   * Obtiene un arquetipo por ID
   */
  async getArchetypeById(id: number): Promise<Archetype | null> {
    if (!id || id <= 0) {
      throw new Error("ID inválido");
    }

    return this.repository.findById(id);
  }

  /**
   * Obtiene un arquetipo por nombre exacto
   */
  async getArchetypeByName(name: string): Promise<Archetype | null> {
    if (!name || name.trim() === "") {
      throw new Error("Nombre inválido");
    }

    return this.repository.findByName(name.trim());
  }

  /**
   * Solicita registro de un arquetipo (incrementa pending_requests)
   */
  async requestArchetypeRegistration(
    requestData: ArchetypeRequestDTO,
  ): Promise<ArchetypeRequestResponse> {
    // Buscar el arquetipo por ID o nombre
    let archetype: Archetype | null = null;

    if (requestData.archetype_id) {
      archetype = await this.getArchetypeById(requestData.archetype_id);
    } else if (requestData.archetype_name) {
      archetype = await this.getArchetypeByName(requestData.archetype_name);
    }

    if (!archetype) {
      throw new Error("Arquetipo no encontrado");
    }

    // Verificar si ya está registrado
    if (archetype.registered) {
      return {
        success: false,
        message: "Este arquetipo ya está registrado",
        archetype,
        current_requests: archetype.pending_requests,
      };
    }

    // Incrementar el contador de solicitudes
    const updated = this.repository.incrementPendingRequests(archetype.id);

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

  /**
   * Aprueba un arquetipo (lo marca como registrado y resetea pending_requests)
   */
  async approveArchetypeRegistration(id: number): Promise<Archetype | null> {
    if (!id || id <= 0) {
      throw new Error("ID inválido");
    }

    const result = this.repository.markAsRegistered(id);

    if (!result) {
      throw new Error(`Arquetipo con ID ${id} no encontrado`);
    }

    return result;
  }

  /**
   * Obtiene arquetipos con solicitudes pendientes
   */
  async getPendingArchetypes(limit?: number): Promise<Archetype[]> {
    return this.repository.findWithPendingRequests(limit);
  }

  /**
   * Limpia las solicitudes pendientes de un arquetipo
   */
  async clearPendingRequests(id: number): Promise<Archetype | null> {
    if (!id || id <= 0) {
      throw new Error("ID inválido");
    }

    const result = this.repository.resetPendingRequests(id);

    if (!result) {
      throw new Error(`Arquetipo con ID ${id} no encontrado`);
    }

    return result;
  }

  /**
   * Obtiene estadísticas mejoradas
   */
  async getStatistics(): Promise<{
    total: number;
    registered: number;
    unregistered: number;
    pending_requests_total: number;
    archetypes_with_requests: number;
  }> {
    return this.repository.getStatistics();
  }

  /**
   * Resto de métodos existentes (sin cambios)...
   */
  async advancedSearch(options: {
    searchTerm?: string;
    registered?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ results: Archetype[]; total: number }> {
    let results: Archetype[] = [];
    let total = 0;

    if (options.searchTerm) {
      results = this.repository.searchByName(
        options.searchTerm,
        options.limit || 50,
      );
      const allResults = this.repository.searchByName(
        options.searchTerm,
        10000,
      );
      total = allResults.length;
    } else {
      results = this.repository.findAll(options.limit, options.offset);
      const allResults = this.repository.findAll();
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
      const existingWithName = this.repository.findByName(newName);

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

    const result = this.repository.markAsUnregistered(id);

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
