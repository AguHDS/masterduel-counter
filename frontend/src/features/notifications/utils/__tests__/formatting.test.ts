import { describe, it, expect } from "vitest";
import {
  formatNotificationMessage,
  formatTimeAgo,
  getNotificationLink,
} from "../formatting";
import type { Notification } from "../../types/notification.types";

function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 1,
    userId: "user-1",
    type: "like",
    read: false,
    count: 1,
    instanceId: 100,
    commentId: null,
    actorId: null,
    actorName: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    instanceTitle: "Test Guide",
    archetypeId: 10,
    archetypeName: "TestArchetype",
    instanceAuthorName: "TestAuthor",
    guideType: "COUNTER",
    ...overrides,
  };
}

describe("formatNotificationMessage", () => {
  it("should format comment notification", () => {
    const result = formatNotificationMessage(
      makeNotification({ type: "comment", actorName: "User1" }),
    );

    expect(result.actionText).toBe("has commented on");
    expect(result.actorName).toBe("User1");
    expect(result.title).toBe("Test Guide");
  });

  it("should format like notification with count=1", () => {
    const result = formatNotificationMessage(
      makeNotification({ type: "like", count: 1 }),
    );

    expect(result.actionText).toBe("1 user liked your guide:");
    expect(result.actorName).toBeNull();
  });

  it("should format like notification with count>1", () => {
    const result = formatNotificationMessage(
      makeNotification({ type: "like", count: 5 }),
    );

    expect(result.actionText).toBe("5 users liked your guide:");
  });

  it("should format favorite notification with count=1", () => {
    const result = formatNotificationMessage(
      makeNotification({ type: "favorite", count: 1 }),
    );

    expect(result.actionText).toBe("1 user favorited your guide:");
  });

  it("should format favorite notification with count>1", () => {
    const result = formatNotificationMessage(
      makeNotification({ type: "favorite", count: 3 }),
    );

    expect(result.actionText).toBe("3 users favorited your guide:");
  });

  it("should format guide_request_fulfilled notification", () => {
    const result = formatNotificationMessage(
      makeNotification({ type: "guide_request_fulfilled", actorName: "Fulfiller" }),
    );

    expect(result.actionText).toBe("fulfilled your guide request:");
    expect(result.actorName).toBe("Fulfiller");
  });

  it("should fallback to 'your guide' when no title", () => {
    const result = formatNotificationMessage(
      makeNotification({ instanceTitle: undefined, type: "comment" }),
    );

    expect(result.title).toBe("your guide");
  });

  it("should return default for unknown type", () => {
    const result = formatNotificationMessage(
      makeNotification({ type: "unknown" as Notification["type"] }),
    );

    expect(result.actionText).toBe("New notification");
    expect(result.title).toBe("");
    expect(result.link).toBeNull();
  });
});

describe("getNotificationLink", () => {
  it("should return null when no instanceId", () => {
    const link = getNotificationLink(makeNotification({ instanceId: null }));

    expect(link).toBeNull();
  });

  it("should build guide path when instanceId exists", () => {
    const link = getNotificationLink(makeNotification({ instanceId: 999 }));

    expect(link).toBeDefined();
    // slugifySegment lowercases, so "TestArchetype" → "testarchetype"
    expect(link).toContain("testarchetype");
    expect(link).toContain("testauthor");
    expect(link).toContain("999");
  });
});

describe("formatTimeAgo", () => {
  it("should return 'Just now' for less than 60 seconds", () => {
    const now = new Date();
    const result = formatTimeAgo(now.toISOString());

    expect(result).toBe("Just now");
  });

  it("should return 'Xm ago' for minutes", () => {
    const date = new Date(Date.now() - 5 * 60 * 1000);

    const result = formatTimeAgo(date.toISOString());

    expect(result).toBe("5m ago");
  });

  it("should return 'Xh ago' for hours", () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000);

    const result = formatTimeAgo(date.toISOString());

    expect(result).toBe("3h ago");
  });

  it("should return 'Xd ago' for days", () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    const result = formatTimeAgo(date.toISOString());

    expect(result).toBe("2d ago");
  });

  it("should return 'Xw ago' for weeks", () => {
    const date = new Date(Date.now() - 3 * 7 * 24 * 60 * 60 * 1000);

    const result = formatTimeAgo(date.toISOString());

    expect(result).toBe("3w ago");
  });

  it("should return 'Xmo ago' for months", () => {
    const date = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);

    const result = formatTimeAgo(date.toISOString());

    expect(result).toBe("6mo ago");
  });

  it("should return 'Xy ago' for years", () => {
    const date = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000);

    const result = formatTimeAgo(date.toISOString());

    expect(result).toBe("2y ago");
  });
});
