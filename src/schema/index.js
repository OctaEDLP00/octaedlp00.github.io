import { z } from "zod";
import { EnchantmentIdNameMap, EnchantmentNames } from "../const.js";

// Esquema de validación para un enchantment individual
/** @type {string[]} */
const validIds = Object.keys(EnchantmentIdNameMap || {});
/** @type {string[]} */
const validNames = validIds.map((k) => EnchantmentIdNameMap[k]);

const enchantmentSchema = z
  .object({
    name: z
      .string({ message: "El valor no es de tipo string" })
      .min(1, { message: "El nombre debe tener al menos 1 carácter" })
      .refine(
        (/** @type {string} */ val) =>
          validIds.indexOf(val) !== -1 || validNames.indexOf(val) !== -1,
        () => ({
          message: `Nombre de encantamiento inválido. Valores válidos: ${validNames.join(", ")}`,
        }),
      ),
    lvl: z
      .number({ message: "El valor no es de tipo number" })
      .int({ message: "El numero no es entero" })
      .positive({ message: "El nivel debe ser un número entero positivo" })
      .min(1),
    price: z
      .number({ message: "El valor no es de tipo number" })
      .positive({ message: "El precio debe ser un número positivo" })
      .min(1)
      .max(64),
  })
  .superRefine(
    (
      /** @type {import('../index.d.mjs').Enchantment} */ data,
      /** @type {any} */ ctx,
    ) => {
      try {
        // Construir mapas rápidos de rangos por id y por nombre
        const limitsById = Object.create(null);
        const limitsByName = Object.create(null);

        for (const e of EnchantmentNames || []) {
          if (e && e.id) {
            limitsById[e.id] = { min: e.minLvl ?? 1, max: e.maxLvl ?? 5 };
          }
          if (e && e.name) {
            limitsByName[e.name] = { min: e.minLvl ?? 1, max: e.maxLvl ?? 5 };
          }
        }

        const nameVal = /** @type {string} */ (data.name);
        let limits = null;

        if (validIds.indexOf(nameVal) !== -1) {
          limits = limitsById[nameVal];
        } else if (validNames.indexOf(nameVal) !== -1) {
          limits = limitsByName[nameVal];
        }

        if (!limits) return; // nombre inválido ya será capturado por la otra validación

        if (typeof data.lvl !== "number") return; // el tipo ya se valida arriba

        if (data.lvl < limits.min || data.lvl > limits.max) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["lvl"],
            message: `Nivel inválido para '${nameVal}'. Debe estar entre ${limits.min} y ${limits.max}.`,
          });
        }
      } catch (err) {
        // No romper la validación si algo inesperado ocurre aquí
        console.error("Error en validación de rango de nivel:", err);
      }
    },
  );

// Esquema de validación para el JSON completo de enchantments
export const enchantmentsJsonSchema = z.object({
  enchantments: z.array(enchantmentSchema).default([]),
});
