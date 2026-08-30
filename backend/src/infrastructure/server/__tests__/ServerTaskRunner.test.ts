import { describe, it, expect, afterEach } from "vitest";
import { spawn } from "child_process";
import { mkdtempSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { ServerTaskRunner } from "@/infrastructure/server/ServerTaskRunner.js";

const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

describe("ServerTaskRunner", () => {
  const runner = new ServerTaskRunner();
  const tempDir = mkdtempSync(join(tmpdir(), "mdc-runner-"));

  afterEach(() => {
    process.env.NODE_ENV = ORIGINAL_NODE_ENV;
  });

  describe("buildCommand", () => {
    it("should build a production command using compiled dist scripts", () => {
      process.env.NODE_ENV = "production";
      const { command, args } = runner.buildCommand("download-cards", { delay: 250, limit: 10 });

      expect(command).toBe(process.execPath);
      expect(args[0].endsWith(join("dist", "scripts", "download-all-cards.js"))).toBe(true);
      expect(args).toContain("--delay");
      expect(args[args.indexOf("--delay") + 1]).toBe("250");
      expect(args).toContain("--limit");
      expect(args[args.indexOf("--limit") + 1]).toBe("10");
    });

    it("should build a development command using tsx loader and source scripts", () => {
      process.env.NODE_ENV = "development";
      const { command, args } = runner.buildCommand("populate-archetypes");

      expect(command).toBe(process.execPath);
      expect(args[0]).toBe("--import");
      expect(args[1]).toBe("tsx");
      expect(args[2].endsWith(join("src", "scripts", "populate-archetypes.ts"))).toBe(true);
    });

    it("should omit delay/limit flags when not provided", () => {
      process.env.NODE_ENV = "production";
      const { args } = runner.buildCommand("generate-thumbnails");

      expect(args.join(" ")).not.toContain("--delay");
      expect(args.join(" ")).not.toContain("--limit");
    });
  });

  describe("tailLog", () => {
    it("should return the last N non-empty lines", () => {
      const logFile = join(tempDir, "tail.log");
      writeFileSync(logFile, "line1\nline2\n\nline3\nline4\n", "utf8");

      const tail = ServerTaskRunner.tailLog(logFile, 2);
      expect(tail).toEqual(["line3", "line4"]);
    });

    it("should return an empty array for a missing file", () => {
      expect(ServerTaskRunner.tailLog(join(tempDir, "missing.log"))).toEqual([]);
    });
  });

  describe("isAlive", () => {
    it("should return false for a null pid", () => {
      expect(ServerTaskRunner.isAlive(null)).toBe(false);
    });

    it("should detect a live process and then a dead one", async () => {
      const child = spawn(process.execPath, ["-e", "setInterval(() => {}, 1000)"], {
        stdio: "ignore",
      });

      expect(ServerTaskRunner.isAlive(child.pid ?? null)).toBe(true);

      child.kill("SIGTERM");
      await new Promise((resolve) => setTimeout(resolve, 300));

      expect(ServerTaskRunner.isAlive(child.pid ?? null)).toBe(false);
    });
  });
});