import EnchantmentsInfo from './data/EnchantmentsInfo.json' with { type: 'json' }

/**
 * @satisfies {import('./index.d.mjs').EnchantmentName}
 */
export const EnchantmentNames = EnchantmentsInfo

/**
 * @type {{ [x: string]: string }}
 */
export const EnchantmentIdNameMap = Object.assign(
  Object.create(null),
  ...EnchantmentNames.filter((e) => e.id).map((e) => ({ [e.id]: e.name })),
);
