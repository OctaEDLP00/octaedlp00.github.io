import { EnchantmentNames } from './const.js'
import { EnchantmentsTable } from './components/enchantments-table.js'
import { EditEnchantmentForm } from './components/edit-enchantment-form.js'
import { AddEnchantmentForm } from './components/add-enchantment-form.js'

import { EnchantmentIdNameMap } from './const.js'

customElements.define('edit-form', EditEnchantmentForm)
customElements.define('add-form', AddEnchantmentForm)
customElements.define('enchantments-table', EnchantmentsTable)

/**
 * Fill options for a given name select element
 * @param {HTMLSelectElement | undefined} nameSelect
 */
function populateNameOptions(nameSelect) {
  if (!nameSelect || !(nameSelect instanceof HTMLSelectElement)) return
  nameSelect.innerHTML = ''
  for (const { name, id } of EnchantmentNames) {
    const option = document.createElement('option')
    option.textContent = name
    option.value = id
    nameSelect.append(option)
  }
}

/**
 * Fill level options for a specific level select given enchantment id
 * @param {HTMLSelectElement} levelSelect
 * @param {string} enchantmentId
 */
function populateLevelsForSelect(levelSelect, enchantmentId) {
  if (!levelSelect || !(levelSelect instanceof HTMLSelectElement)) return
  levelSelect.innerHTML = ''
  const enchant = EnchantmentNames.find(e => e.id === enchantmentId)
  if (!enchant) {
    const opt = document.createElement('option')
    opt.value = ''
    opt.textContent = 'Seleccione nivel'
    opt.disabled = true
    opt.selected = true
    levelSelect.append(opt)
    return
  }

  for (let lvl = enchant.minLvl; lvl <= enchant.maxLvl; lvl++) {
    const opt = document.createElement('option')
    opt.value = String(lvl)
    opt.textContent = String(lvl)
    levelSelect.append(opt)
  }
  levelSelect.value = String(enchant.minLvl)
}

function initEnchantmentSelectors() {
  // Find add-form and edit-form elements and populate their selects inside shadow DOM
  const addFormEl = document.querySelector('add-form')
  const editFormEl = document.querySelector('edit-form')

  if (addFormEl instanceof HTMLElement && addFormEl.shadowRoot) {
    const nameSel = addFormEl.shadowRoot.getElementById('enchantment-name')
    const levelSel = addFormEl.shadowRoot.getElementById('enchantment-level')
    if (nameSel instanceof HTMLSelectElement) populateNameOptions(nameSel)
    if (nameSel instanceof HTMLSelectElement && levelSel instanceof HTMLSelectElement) {
      nameSel.addEventListener('change', ev => {
        populateLevelsForSelect(levelSel, /** @type {HTMLSelectElement} */ (ev.target).value)
      })
      const initial = nameSel.value || nameSel.querySelector('option')?.value || ''
      if (initial) populateLevelsForSelect(levelSel, initial)
    }
  }

  if (editFormEl instanceof HTMLElement && editFormEl.shadowRoot) {
    const nameSel = editFormEl.shadowRoot.getElementById('edit-name')
    const levelSel = editFormEl.shadowRoot.getElementById('edit-level')
    if (nameSel instanceof HTMLSelectElement) populateNameOptions(nameSel)
    if (nameSel instanceof HTMLSelectElement && levelSel instanceof HTMLSelectElement) {
      nameSel.addEventListener('change', ev => {
        populateLevelsForSelect(levelSel, /** @type {HTMLSelectElement} */ (ev.target).value)
      })
      const initial = nameSel.value || nameSel.querySelector('option')?.value || ''
      if (initial) populateLevelsForSelect(levelSel, initial)
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEnchantmentSelectors)
} else {
  initEnchantmentSelectors()
}
