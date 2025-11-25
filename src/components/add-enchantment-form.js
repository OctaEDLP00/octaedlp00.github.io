import loaderCss from '../lib/loaderCss.js'
import css from './styles/add-enchantments-form.css?raw'

export class AddEnchantmentForm extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.render()
    this.init()
    // Listen for show-edit-form event to hide this form
    document.addEventListener('show-edit-form', () => {
      this.style.display = 'none'
    })
    // Also listen for cancel-edit to show this form again
    document.addEventListener('cancel-edit', () => {
      this.style.display = 'block'
    })
  }

  /**
   * Hook up submission to emit a custom event so the table (or any listener)
   * can handle adding the enchantment.
   */
  init() {
    /**
     * @type {HTMLFormElement | undefined | null}
     */
    const form = this.shadowRoot?.querySelector('#enchantment-add-form')
    const cancelBtn = this.shadowRoot?.querySelector('#cancel-btn')

    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault()
        const name = /** @type {HTMLSelectElement | null} */ (
          this.shadowRoot?.querySelector('#enchantment-name')
        )
        const lvl = /** @type {HTMLSelectElement | null} */ (
          this.shadowRoot?.querySelector('#enchantment-level')
        )
        const price = /** @type {HTMLSelectElement | null} */ (
          this.shadowRoot?.querySelector('#price')
        )

        if (!name || !lvl || !price) return

        const detail = {
          name: name.value,
          lvl: parseInt(lvl.value, 10) || 0,
          price: parseInt(price.value, 10) || 0,
        }

        // Dispatch an event that bubbles out of the shadow DOM so listeners
        // (like EnchantmentsTable) can react.
        this.dispatchEvent(
          new CustomEvent('add-enchantment', {
            detail,
            bubbles: true,
            composed: true,
          }),
        )

        form.reset()
      })
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('cancel-add', { bubbles: true, composed: true }))
      })
    }
  }

  render() {
    this.shadowRoot?.setHTMLUnsafe(/* html */ `
      <div class="form-container">
        <h2 id="form-title">✨ Agregar Nuevo Encantamiento</h2>
        <form id="enchantment-add-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="enchantment-name">Nombre del Encantamiento</label>
              <select name="enchantment-name" id="enchantment-name">
              <option disabled selected>Selecciona el Encantamientos</option>
              </select>
            </div>
            <div class="form-group">
              <label for="enchantment-level">Nivel del Encantamiento</label>
              <select name="enchantment-level" id="enchantment-level">
                <option disabled selected>Selecciona un nivel</option>
              </select>
            </div>
            <div class="form-group">
              <label for="price" >Precio del Encantamiento</label>
              <select name="enchantment-price" id="price">
                <option selected disabled>Selecciona el precio</option>
              </select>
            </div>
          </div>
          <div class="button-group">
            <button type="submit" class="btn-add" id="submit-btn">
              Agregar Encantamiento
            </button>
            <button type="button" class="btn-cancel" id="cancel-btn">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    `)
    this.shadowRoot?.adoptedStyleSheets.push(loaderCss(css))
  }
}
