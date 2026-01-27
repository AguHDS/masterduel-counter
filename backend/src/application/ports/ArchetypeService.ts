import {
  Archetype,
  ArchetypeUpdateDTO,
  ArchetypeRequestDTO,
  ArchetypeRequestResponse,
  ArchetypeCreateDTO,
} from "@/domain/Archetype";

export interface CardPairDTO {
  topCardId: number;
  bottomCardId: number;
  effectiveness?: string;
  comment?: string;
}

export interface RegisterArchetypeDTO {
  archetypeId: number;
  cardPairs: CardPairDTO[];
  headerCardId?: number;
}

export interface ArchetypeServicePort {
  /**
   * Searches archetypes by a search term using partial matching
   * @param searchTerm - Search term (partial or full name)
   * @param limit - Maximum number of results (optional)
   * @returns Array of archetypes that match the search term
   */
  searchArchetypes(searchTerm: string, limit?: number): Promise<Archetype[]>;

  /**
   * Retrieves an archetype by its unique ID
   * @param id - Archetype ID
   * @returns Found archetype or null if it does not exist
   */
  getArchetypeById(id: number): Promise<Archetype | null>;

  /**
   * Retrieves an archetype by its exact name
   * @param name - Exact name of the archetype
   * @returns Found archetype or null if it does not exist
   */
  getArchetypeByName(name: string): Promise<Archetype | null>;

  /**
   * Requests the registration of an archetype by increasing its request counter
   * If the archetype does not exist, it is created. If it reaches the threshold, it is marked as registered.
   * @param requestData - Request data (archetype_id or archetype_name)
   * @returns Response with the updated archetype and current number of requests
   */
  requestArchetypeRegistration(
    requestData: ArchetypeRequestDTO,
  ): Promise<ArchetypeRequestResponse>;

  /**
   * Manually approves the registration of an archetype (admin action)
   * Marks the archetype as registered regardless of pending requests
   * @param id - ID of the archetype to approve
   * @returns Updated archetype or null if it does not exist
   */
  approveArchetypeRegistration(id: number): Promise<Archetype | null>;

  /**
   * Retrieves archetypes with pending requests ordered by number of requests
   * @param limit - Maximum number of results (optional)
   * @returns Array of archetypes with pending requests
   */
  getPendingArchetypes(limit?: number): Promise<Archetype[]>;

  /**
   * Clears the pending request counter of an archetype
   * @param id - Archetype ID
   * @returns Updated archetype or null if it does not exist
   */
  clearPendingRequests(id: number): Promise<Archetype | null>;

  /**
   * Retrieves general statistics about archetypes in the system
   * @returns Object with statistics: total, registered, unregistered, total pending requests, etc
   */
  getStatistics(): Promise<{
    total: number;
    registered: number;
    unregistered: number;
    pending_requests_total: number;
    archetypes_with_requests: number;
  }>;

  /**
   * Performs an advanced search with multiple criteria and pagination
   * @param options - Search options (term, registered filter, limit, offset)
   * @returns Paginated results with total matches
   */
  advancedSearch(options: {
    searchTerm?: string;
    registered?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ results: Archetype[]; total: number }>;

  /**
   * Retrieves all archetypes with optional pagination
   * @param limit - Maximum number of results (optional)
   * @param offset - Number of results to skip (optional)
   * @returns Array of archetypes
   */
  getAllArchetypes(limit?: number, offset?: number): Promise<Archetype[]>;

  /**
   * Creates a new archetype in the system.
   * @param archetypeData - Archetype data to create (name, registered, pending requests)
   * @returns Created archetype
   */
  createArchetype(archetypeData: ArchetypeCreateDTO): Promise<Archetype>;

  /**
   * Updates the data of an existing archetype
   * @param id - ID of the archetype to update
   * @param archetypeData - Data to update (name, registered, pending requests)
   * @returns Updated archetype or null if it does not exist
   */
  updateArchetype(
    id: number,
    archetypeData: ArchetypeUpdateDTO,
  ): Promise<Archetype | null>;

  /**
   * Marks an archetype as unregistered
   * @param id - Archetype ID
   * @returns Updated archetype or null if it does not exist
   */
  markAsUnregistered(id: number): Promise<Archetype | null>;

  /**
   * Checks whether an archetype with the specified name exists
   * @param name - Name of the archetype to check
   * @returns true if it exists, false otherwise
   */
  archetypeExists(name: string): Promise<boolean>;

  /**
   * Suggests archetypes based on a partial name (autocomplete)
   * @param partialName - Part of the archetype name
   * @param limit - Maximum number of suggestions (optional)
   * @returns Array of suggested archetypes
   */
  suggestArchetypes(partialName: string, limit?: number): Promise<Archetype[]>;

  /**
   * Registers an archetype with its card pairs
   * Confirms the cards (marks them as permanent), saves the pairs, and marks the archetype as registered
   * @param registerData - Registration data (archetype ID and card pairs)
   * @returns Updated archetype
   */
  registerArchetypeWithPairs(
    registerData: RegisterArchetypeDTO,
  ): Promise<Archetype>;
}
