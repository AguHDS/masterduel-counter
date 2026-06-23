import { ComboStepRepository } from "@/domain/ports/ComboStepRepository.js";
import {
  ComboStep,
  ComboStepCreateDTO,
  ComboStepWithCards,
} from "@/domain/ComboStep.js";
import Database from "better-sqlite3";

export class SqliteComboStepRepository implements ComboStepRepository {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  async createManyComboSteps(
    steps: ComboStepCreateDTO[],
  ): Promise<ComboStep[]> {
    const stepStmt = this.db.prepare(`
      INSERT INTO combo_steps (initial_hand_id, step_order, description, parent_canceled_step_id, step_type, left_scale_value, right_scale_value)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING id, initial_hand_id, step_order, description, parent_canceled_step_id, step_type, left_scale_value, right_scale_value, created_at
    `);

    const mainCardStmt = this.db.prepare(`
      INSERT INTO combo_step_main_cards (step_id, card_id, position, chain_number)
      VALUES (?, ?, ?, ?)
    `);

    const subCardStmt = this.db.prepare(`
      INSERT INTO combo_step_sub_cards (step_id, card_id, position, chain_number)
      VALUES (?, ?, ?, ?)
    `);

    const leftSubCardStmt = this.db.prepare(`
      INSERT INTO combo_step_left_sub_cards (step_id, card_id, position, chain_number)
      VALUES (?, ?, ?, ?)
    `);

    const results: ComboStep[] = [];

    for (const step of steps) {
      // Create the step
      const result = stepStmt.get(
        step.initialHandId,
        step.stepOrder,
        step.description || null,
        step.parentCanceledStepId || null,
        step.stepType || null,
        step.leftScaleValue ?? null,
        step.rightScaleValue ?? null,
      ) as Omit<ComboStep, "mainCardIds" | "subCardIds" | "leftSubCardIds"> & { parent_canceled_step_id: number | null; step_type: string | null; left_scale_value: number | null; right_scale_value: number | null };

      // Insert main cards with position and chain number
      step.mainCardIds.forEach((cardId, index) => {
        mainCardStmt.run(result.id, cardId, index, step.mainCardChains?.[index] ?? null);
      });

      // Insert sub cards with position and chain number
      step.subCardIds.forEach((cardId, index) => {
        subCardStmt.run(result.id, cardId, index, step.subCardChains?.[index] ?? null);
      });

      // Insert left sub cards with position and chain number
      step.leftSubCardIds.forEach((cardId, index) => {
        leftSubCardStmt.run(result.id, cardId, index, step.leftSubCardChains?.[index] ?? null);
      });

      results.push({
        id: result.id,
        initialHandId: result.initialHandId,
        stepOrder: result.stepOrder,
        description: result.description,
        parentCanceledStepId: result.parent_canceled_step_id,
        stepType: result.step_type,
        leftScaleValue: result.left_scale_value,
        rightScaleValue: result.right_scale_value,
        createdAt: result.createdAt,
        mainCardIds: step.mainCardIds,
        subCardIds: step.subCardIds,
        leftSubCardIds: step.leftSubCardIds,
      });
    }

    return results;
  }

  async findComboStepsByInitialHandId(
    initialHandId: number,
  ): Promise<ComboStepWithCards[]> {
    const stepStmt = this.db.prepare(`
      SELECT id, initial_hand_id, step_order, description, parent_canceled_step_id, step_type, left_scale_value, right_scale_value, created_at
      FROM combo_steps
      WHERE initial_hand_id = ?
      ORDER BY step_order
    `);

    const mainCardStmt = this.db.prepare(`
      SELECT c.id, c.name, c.image_url, c.image_url_small, c.image_url_cropped,
             csmc.chain_number
      FROM combo_step_main_cards csmc
      INNER JOIN cards c ON csmc.card_id = c.id
      WHERE csmc.step_id = ?
      ORDER BY csmc.position
    `);

    const subCardStmt = this.db.prepare(`
      SELECT c.id, c.name, c.image_url, c.image_url_small, c.image_url_cropped,
             cssc.chain_number
      FROM combo_step_sub_cards cssc
      INNER JOIN cards c ON cssc.card_id = c.id
      WHERE cssc.step_id = ?
      ORDER BY cssc.position
    `);

    const leftSubCardStmt = this.db.prepare(`
      SELECT c.id, c.name, c.image_url, c.image_url_small, c.image_url_cropped,
             cslsc.chain_number
      FROM combo_step_left_sub_cards cslsc
      INNER JOIN cards c ON cslsc.card_id = c.id
      WHERE cslsc.step_id = ?
      ORDER BY cslsc.position
    `);

    interface StepRow {
      id: number;
      initial_hand_id: number;
      step_order: number;
      description: string | null;
      parent_canceled_step_id: number | null;
      step_type: string | null;
      left_scale_value: number | null;
      right_scale_value: number | null;
      created_at: string;
    }

    const steps = stepStmt.all(initialHandId) as StepRow[];

    return steps.map((step) => ({
      id: step.id,
      initialHandId: step.initial_hand_id,
      stepOrder: step.step_order,
      description: step.description,
      parentCanceledStepId: step.parent_canceled_step_id,
      stepType: step.step_type,
      leftScaleValue: step.left_scale_value,
      rightScaleValue: step.right_scale_value,
      createdAt: step.created_at,
      mainCards: mainCardStmt.all(step.id) as Array<{
        id: number;
        name: string;
        image_url: string;
        image_url_small: string;
        image_url_cropped: string;
        chain_number: number | null;
      }>,
      subCards: subCardStmt.all(step.id) as Array<{
        id: number;
        name: string;
        image_url: string;
        image_url_small: string;
        image_url_cropped: string;
        chain_number: number | null;
      }>,
      leftSubCards: leftSubCardStmt.all(step.id) as Array<{
        id: number;
        name: string;
        image_url: string;
        image_url_small: string;
        image_url_cropped: string;
        chain_number: number | null;
      }>,
    }));
  }

  async deleteComboStepsByInitialHandId(initialHandId: number): Promise<void> {
    const stmt = this.db.prepare(`
      DELETE FROM combo_steps
      WHERE initial_hand_id = ?
    `);

    stmt.run(initialHandId);
  }

  async deleteComboStepsByInstanceId(instanceId: number): Promise<void> {
    const stmt = this.db.prepare(`
      DELETE FROM combo_steps
      WHERE initial_hand_id IN (
        SELECT id FROM initial_hands WHERE instance_id = ?
      )
    `);

    stmt.run(instanceId);
  }
}
