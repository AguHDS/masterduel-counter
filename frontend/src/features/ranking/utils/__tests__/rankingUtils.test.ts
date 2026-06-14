import { describe, it, expect } from "vitest";
import { getRankColor, getRankRowBg } from "../rankingUtils";

describe("getRankColor", () => {
  it("should return yellow for rank 1", () => {
    expect(getRankColor(1)).toBe("text-yellow-400");
  });

  it("should return silver for rank 2", () => {
    expect(getRankColor(2)).toBe("text-slate-300");
  });

  it("should return bronze for rank 3", () => {
    expect(getRankColor(3)).toBe("text-amber-500");
  });

  it("should return gray for rank 4+", () => {
    expect(getRankColor(4)).toBe("text-gray-500");
    expect(getRankColor(10)).toBe("text-gray-500");
    expect(getRankColor(100)).toBe("text-gray-500");
  });
});

describe("getRankRowBg", () => {
  it("should return gold gradient for rank 1", () => {
    const bg = getRankRowBg(1);
    expect(bg).toContain("yellow");
    expect(bg).toMatch(/bg-gradient/);
  });

  it("should return silver gradient for rank 2", () => {
    const bg = getRankRowBg(2);
    expect(bg).toContain("slate");
    expect(bg).toMatch(/bg-gradient/);
  });

  it("should return bronze gradient for rank 3", () => {
    const bg = getRankRowBg(3);
    expect(bg).toContain("amber");
    expect(bg).toMatch(/bg-gradient/);
  });

  it("should return empty string for rank 4+", () => {
    expect(getRankRowBg(4)).toBe("");
    expect(getRankRowBg(10)).toBe("");
  });
});
