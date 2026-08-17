/* =========================================================================
   Formulary import.

   Loads the medication dictionary from the CSV files at the repository root
   into the `medications` and `medication_ingredients` tables.

   THIS IS REFERENCE DATA, NOT PATIENT DATA. The files describe marketed
   products and their active ingredients. Nothing here is specific to a person,
   and this script is safe to run against any environment.

   IT IS AN IMPORT, NOT A SEED. Every row carries the source file's own
   identifier, so re-running updates rather than duplicating, and the formulary
   can be refreshed as the market changes without touching application code.
   That is the point of holding it in a table at all: a hard-coded list would
   need a release to add a brand.

   Run with:  npm run db:import-formulary
   ========================================================================= */

import { readFile } from "node:fs/promises";
import path from "node:path";

import { PrismaClient, type MedicationRoute } from "@prisma/client";

import { MED_CLASSES } from "@/lib/medication-engine";

const prisma = new PrismaClient();

const REPO_ROOT = path.resolve(import.meta.dirname, "..");
const INGREDIENTS_FILE = process.env.CORSC_INGREDIENTS_CSV || "ingredients 2.0.csv";
const PRODUCTS_FILE = process.env.CORSC_PRODUCTS_CSV || "products 2.0.csv";

const KNOWN_CLASSES = new Set<string>(MED_CLASSES.map((item: { id: string }) => item.id));

/* ------------------------------------------------------------------- CSV */

/**
 * A minimal RFC 4180 reader.
 *
 * Written here rather than pulled in as a dependency: the formulary files are
 * the only CSV this project reads, and a build-time dependency added for one
 * script is a supply-chain surface for no benefit.
 */
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }

  const [header, ...body] = rows;
  if (!header) return [];

  return body
    .filter((entry) => entry.some((cell) => cell.trim() !== ""))
    .map((entry) =>
      Object.fromEntries(header.map((column, index) => [column.trim(), (entry[index] ?? "").trim()]))
    );
}

/* ------------------------------------------------------------- transforms */

const FORM_TO_ROUTE: Record<string, MedicationRoute> = {
  tablet: "ORAL",
  capsule: "ORAL",
  syrup: "ORAL",
  suspension: "ORAL",
  injection: "INTRAVENOUS",
  vial: "INTRAVENOUS",
  patch: "TRANSDERMAL",
  inhaler: "INHALED",
  spray: "INHALED",
  cream: "TOPICAL",
  ointment: "TOPICAL",
  drops: "TOPICAL",
};

/**
 * Splits "Glimepiride 1 mg + Metformin 500 mg" into its ingredients.
 *
 * A component that cannot be split into a name and a strength keeps the whole
 * string as its name rather than being dropped — an ingredient CORSC failed to
 * parse still needs to appear on the patient's list.
 */
function parseIngredients(value: string): Array<{ name: string; strength: string | null }> {
  return value
    .split("+")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const match = part.match(/^(.*?)[\s]+([\d.]+\s*(?:mg|mcg|g|ml|iu|units?)\b.*)$/i);
      if (!match) return { name: part, strength: null };
      return { name: match[1].trim(), strength: match[2].trim() };
    });
}

/** The cardiovascular class, when the source file names one CORSC recognises. */
function resolveClass(sourceClass: string): string | null {
  const value = sourceClass.trim();
  if (!value) return null;
  if (KNOWN_CLASSES.has(value)) return value;
  // The formulary carries classes CORSC's cardioprotective logic does not act
  // on ("dermatology", "ophthalmology"). They are kept out of medication_class
  // rather than mapped onto "other", so that a null there means "not a class
  // this application reasons about" rather than "unclassified".
  return null;
}

/* ---------------------------------------------------------------- import */

async function main() {
  const [ingredientsCsv, productsCsv] = await Promise.all([
    readFile(path.join(REPO_ROOT, INGREDIENTS_FILE), "utf8"),
    readFile(path.join(REPO_ROOT, PRODUCTS_FILE), "utf8"),
  ]);

  const ingredients = parseCsv(ingredientsCsv);
  const products = parseCsv(productsCsv);

  const classByIngredient = new Map<string, string | null>();
  const idByIngredientName = new Map<string, string>();
  ingredients.forEach((row) => {
    const id = row.ingredient_id;
    const name = row.name;
    if (!id || !name) return;
    classByIngredient.set(id, resolveClass(row.class));
    idByIngredientName.set(name.toLowerCase(), id);
  });

  let created = 0;
  let updated = 0;
  let skipped = 0;

  // Single-ingredient entries first, so that searching for a generic name finds
  // the ingredient even where no branded product is listed.
  for (const row of ingredients) {
    if (!row.ingredient_id || !row.name) {
      skipped += 1;
      continue;
    }

    const externalId = `ingredient:${row.ingredient_id}`;
    const data = {
      genericName: row.name,
      brandName: null,
      strength: row.dose_target ? `${row.dose_target} ${row.dose_unit || "mg"}`.trim() : null,
      dosageForm: null,
      route: "ORAL" as MedicationRoute,
      isCombination: false,
      aliases: [row.ingredient_id.toLowerCase()],
      medicationClass: classByIngredient.get(row.ingredient_id) ?? null,
      active: true,
    };

    const result = await prisma.medication.upsert({
      where: { externalId },
      create: {
        externalId,
        ...data,
        ingredients: {
          create: [
            {
              ingredientId: row.ingredient_id,
              name: row.name,
              strength: data.strength,
              ingredientClass: data.medicationClass,
            },
          ],
        },
      },
      update: data,
      select: { createdAt: true, updatedAt: true },
    });
    if (result.createdAt.getTime() === result.updatedAt.getTime()) created += 1;
    else updated += 1;
  }

  for (const row of products) {
    if (!row.product_id || !row.brand) {
      skipped += 1;
      continue;
    }

    const parsed = parseIngredients(row.resolved_ingredients || "");
    const isCombination =
      row.combination.toUpperCase() === "COMBINATION" || parsed.length > 1;

    const ingredientClasses = parsed
      .map((entry) => classByIngredient.get(idByIngredientName.get(entry.name.toLowerCase()) || "") ?? null)
      .filter(Boolean) as string[];

    const externalId = `product:${row.product_id}`;
    const data = {
      // A branded combination has no single generic name; the resolved
      // ingredient string is the closest true statement, so it is used rather
      // than picking one component and implying the product is only that.
      genericName: parsed.length === 1 ? parsed[0].name : row.resolved_ingredients || row.brand,
      brandName: row.brand,
      strength: row.strength || null,
      dosageForm: row.form || null,
      route: FORM_TO_ROUTE[(row.form || "").toLowerCase()] ?? ("ORAL" as MedicationRoute),
      isCombination,
      aliases: (row.aliases || "")
        .split(";")
        .map((alias) => alias.trim().toLowerCase())
        .filter(Boolean),
      // A combination's class is only set when every component agrees; a
      // product that is half beta-blocker and half diuretic is neither, and
      // labelling it as one would make the duplication check wrong.
      medicationClass:
        ingredientClasses.length === 1 || new Set(ingredientClasses).size === 1
          ? ingredientClasses[0] ?? null
          : null,
      active: true,
    };

    const existing = await prisma.medication.findUnique({
      where: { externalId },
      select: { id: true },
    });

    if (existing) {
      await prisma.medication.update({ where: { externalId }, data });
      await prisma.medicationIngredient.deleteMany({ where: { medicationId: existing.id } });
      if (parsed.length) {
        await prisma.medicationIngredient.createMany({
          data: parsed.map((entry) => ({
            medicationId: existing.id,
            ingredientId: idByIngredientName.get(entry.name.toLowerCase()) ?? null,
            name: entry.name,
            strength: entry.strength,
            ingredientClass:
              classByIngredient.get(idByIngredientName.get(entry.name.toLowerCase()) || "") ?? null,
          })),
        });
      }
      updated += 1;
      continue;
    }

    await prisma.medication.create({
      data: {
        externalId,
        ...data,
        ingredients: {
          create: parsed.map((entry) => ({
            ingredientId: idByIngredientName.get(entry.name.toLowerCase()) ?? null,
            name: entry.name,
            strength: entry.strength,
            ingredientClass:
              classByIngredient.get(idByIngredientName.get(entry.name.toLowerCase()) || "") ?? null,
          })),
        },
      },
    });
    created += 1;
  }

  console.info(
    `Formulary import complete: ${created} created, ${updated} updated, ${skipped} skipped (rows with no identifier or name).`
  );
}

main()
  .catch((error) => {
    console.error("Formulary import failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
