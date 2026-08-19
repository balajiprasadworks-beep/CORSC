/* =========================================================================
   AI note tools — server side only.

   Two features, both strictly extraction/phrasing over facts the clinician
   already supplied, never a source of new clinical facts:

   - extractNoteFields: pulls only what is explicitly stated in pasted text
     (a referral letter, a prior note) into the same structured shape the
     workflow already uses, so it can be offered field-by-field for the
     clinician to accept — never applied silently.
   - draftVisitNote: turns the already-computed, already-local clinical
     narrative into a natural-prose draft for the consultant notes field,
     instructed not to add anything beyond what it was given.

   This is a deliberate exception to CORSC's "generated locally in this
   browser" design (lib/ai-summary.js, components/ai-assistant.jsx): the text
   a clinician pastes, or the locally-derived narrative sent for phrasing,
   leaves the browser to the configured LLM provider. Both routes require an
   explicit clinician action (paste + click) and are labelled as such in the
   UI — nothing here runs automatically or silently.
   ========================================================================= */

import { ApiError } from "@/lib/backend/errors";
import { SYMPTOMS } from "@/lib/clinical-data";

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = process.env.OPENAI_MODEL || "gpt-5";

function requireApiKey(): string {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw ApiError.notConfigured("AI note tools are not configured on this deployment. Set OPENAI_API_KEY to enable them.");
  }
  return key;
}

async function chat(messages: { role: string; content: string }[], jsonMode = false): Promise<string> {
  const key = requireApiKey();
  let response: Response;
  try {
    response = await fetch(OPENAI_CHAT_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0,
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
    });
  } catch {
    throw ApiError.notConfigured("Could not reach the AI provider. Try again shortly.");
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw ApiError.notConfigured(`The AI provider request failed (${response.status}). ${detail.slice(0, 200)}`.trim());
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw ApiError.notConfigured("The AI provider returned an empty response.");
  }
  return content;
}

export interface ExtractedNoteFields {
  symptoms: string[];
  vitals: Partial<Record<"sbp" | "dbp" | "pulse" | "weight" | "temp" | "spo2" | "rr", number>>;
  investigations: Partial<Record<"lvef" | "gls" | "troponin" | "ntprobnp", number>>;
  medications: string[];
  notes: string;
}

/**
 * Extracts only what is explicitly stated in a pasted clinical note.
 *
 * The model is instructed to omit anything not literally present rather than
 * infer it — the same no-invention discipline lib/treatment-course.js applies
 * to free-text regimens. The caller must still treat the result as a
 * suggestion: nothing from this function is written to the record until a
 * clinician accepts it field by field.
 */
export async function extractNoteFields(noteText: string): Promise<ExtractedNoteFields> {
  const system = [
    "You extract only facts explicitly stated in a clinical note into JSON.",
    "Never infer, guess, estimate or fill in a value that is not literally present in the text.",
    "If a field is not mentioned, omit its key entirely rather than writing null, 0 or an empty value.",
    `"symptoms" entries must each exactly match one of: ${SYMPTOMS.join(", ")}. Do not include a symptom unless the text states the patient has it now.`,
    "Return ONLY a single JSON object with this shape, no prose, no markdown fences:",
    '{"symptoms": string[], "vitals": {"sbp"?: number, "dbp"?: number, "pulse"?: number, "weight"?: number, "temp"?: number, "spo2"?: number, "rr"?: number}, "investigations": {"lvef"?: number, "gls"?: number, "troponin"?: number, "ntprobnp"?: number}, "medications": string[], "notes": string}',
    '"notes" is at most one sentence describing anything else clinically notable that does not fit the fields above, or "" if nothing does.',
  ].join(" ");

  const content = await chat(
    [
      { role: "system", content: system },
      { role: "user", content: noteText },
    ],
    true
  );

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw ApiError.notConfigured("The AI provider's response could not be read as structured data.");
  }
  if (!parsed || typeof parsed !== "object") {
    throw ApiError.notConfigured("The AI provider's response was not a JSON object.");
  }
  const raw = parsed as Record<string, unknown>;
  const validSymptoms = new Set(SYMPTOMS);
  return {
    symptoms: Array.isArray(raw.symptoms) ? raw.symptoms.filter((s): s is string => typeof s === "string" && validSymptoms.has(s)) : [],
    vitals: typeof raw.vitals === "object" && raw.vitals ? (raw.vitals as ExtractedNoteFields["vitals"]) : {},
    investigations:
      typeof raw.investigations === "object" && raw.investigations ? (raw.investigations as ExtractedNoteFields["investigations"]) : {},
    medications: Array.isArray(raw.medications) ? raw.medications.filter((m): m is string => typeof m === "string") : [],
    notes: typeof raw.notes === "string" ? raw.notes : "",
  };
}

/**
 * Turns an already-locally-computed clinical narrative into natural prose for
 * the consultant notes field. The model is given the finished narrative as
 * its only source of fact and told not to add to it — this is a phrasing
 * pass, not a second opinion.
 */
export async function draftVisitNote(context: string): Promise<string> {
  const system =
    "You write a concise, professional clinic note in prose from the facts given. " +
    "Do not invent, assume or add any clinical fact, plan item or recommendation that is not present in the input. " +
    "Write 3 to 6 sentences suitable to paste directly into a clinical record. Return only the note text, no heading, no markdown.";

  const content = await chat([
    { role: "system", content: system },
    { role: "user", content: context },
  ]);
  return content.trim();
}
