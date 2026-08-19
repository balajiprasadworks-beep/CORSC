/* =========================================================================
   lib/backend/services/ai-service.ts

   These tests stub global.fetch rather than calling OpenAI, so they check the
   contract this codebase actually depends on: that a note is only ever
   returned as a structured suggestion (never silently trusted), that fields
   not present in the note are dropped rather than defaulted, and that a
   missing or failing provider fails loudly with the existing not_configured
   error rather than crashing or returning invented data.
   ========================================================================= */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/backend/errors";
import { draftVisitNote, extractNoteFields } from "@/lib/backend/services/ai-service";

const ORIGINAL_KEY = process.env.OPENAI_API_KEY;
const ORIGINAL_FETCH = global.fetch;

function mockChatResponse(content: string, ok = true, status = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => ({ choices: [{ message: { content } }] }),
    text: async () => content,
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  process.env.OPENAI_API_KEY = "test-key";
});

afterEach(() => {
  process.env.OPENAI_API_KEY = ORIGINAL_KEY;
  global.fetch = ORIGINAL_FETCH;
  vi.restoreAllMocks();
});

describe("extractNoteFields", () => {
  it("keeps only symptoms that exactly match the controlled vocabulary", async () => {
    mockChatResponse(JSON.stringify({ symptoms: ["Dyspnoea", "made-up symptom", "Chest pain"] }));
    const result = await extractNoteFields("Patient reports breathlessness and chest pain.");
    expect(result.symptoms).toEqual(["Dyspnoea", "Chest pain"]);
  });

  it("omits any field the model did not include, rather than defaulting it", async () => {
    mockChatResponse(JSON.stringify({ symptoms: [] }));
    const result = await extractNoteFields("No relevant findings.");
    expect(result.vitals).toEqual({});
    expect(result.investigations).toEqual({});
    expect(result.medications).toEqual([]);
    expect(result.notes).toBe("");
  });

  it("carries through vitals and investigation values the model did find", async () => {
    mockChatResponse(JSON.stringify({ vitals: { sbp: 150, dbp: 95 }, investigations: { lvef: 52 } }));
    const result = await extractNoteFields("BP 150/95. LVEF 52% on recent echo.");
    expect(result.vitals).toEqual({ sbp: 150, dbp: 95 });
    expect(result.investigations).toEqual({ lvef: 52 });
  });

  it("fails loudly rather than returning invented data when the response is not valid JSON", async () => {
    mockChatResponse("this is not json");
    await expect(extractNoteFields("some note")).rejects.toBeInstanceOf(ApiError);
  });

  it("fails with a clear not_configured error when no API key is set", async () => {
    delete process.env.OPENAI_API_KEY;
    await expect(extractNoteFields("some note")).rejects.toMatchObject({ code: "not_configured", status: 503 });
  });

  it("surfaces a provider failure as not_configured rather than crashing", async () => {
    mockChatResponse("", false, 500);
    await expect(extractNoteFields("some note")).rejects.toMatchObject({ code: "not_configured" });
  });
});

describe("draftVisitNote", () => {
  it("returns the model's prose trimmed", async () => {
    mockChatResponse("  A concise draft note.  ");
    const result = await draftVisitNote("Structured facts already on file.");
    expect(result).toBe("A concise draft note.");
  });

  it("fails with a clear error when no API key is set", async () => {
    delete process.env.OPENAI_API_KEY;
    await expect(draftVisitNote("context")).rejects.toMatchObject({ code: "not_configured", status: 503 });
  });
});
