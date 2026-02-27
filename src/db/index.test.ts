import { describe, it, expect, beforeEach } from "vitest";
import { db } from "./index";

describe("AppDatabase", () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it("should add and retrieve a course", async () => {
    const courseId = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.courses.add({
      courseId,
      name: "Test Course",
      type: "Canonical",
      privacyMode: "LocalOnly",
      createdAt: now,
      updatedAt: now,
    });

    const course = await db.courses.get(courseId);
    expect(course).toBeDefined();
    expect(course!.name).toBe("Test Course");
    expect(course!.type).toBe("Canonical");
  });

  it("should list all 28 tables", () => {
    const tableNames = db.tables.map((t) => t.name).sort();
    expect(tableNames).toContain("courses");
    expect(tableNames).toContain("questions");
    expect(tableNames).toContain("quizSessions");
    expect(tableNames).toContain("attempts");
    expect(tableNames).toContain("knowledgeMaps");
    expect(tableNames).toContain("auditLog");
    expect(tableNames.length).toBe(28);
  });
});
