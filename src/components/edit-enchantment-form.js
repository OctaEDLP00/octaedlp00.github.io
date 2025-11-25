import loaderCss from '../lib/loaderCss.js'
import css from './styles/edit-enchantments-form.css?raw'

export class EditEnchantmentForm extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this._editingIndex = -1
  }

  connectedCallback() {
    this.render()
    this.setupListeners()
    // By default, hide the edit form
    this.style.display = 'none'
  }

  setupListeners() {
    // Listen for populate-edit events dispatched by the table
    /** @param {Event} e */
    const onPopulate = e => {
      const event = e instanceof CustomEvent ? e : null
      if (!event) return
      const detail = event.detail || {}
      const index = detail.index
      const item = detail.item
      if (typeof index !== 'number' || !item) return

      this._editingIndex = index
      const nameInput = this.shadowRoot?.getElementById('edit-name')
      const lvlInput = this.shadowRoot?.getElementById('edit-level')
      const priceInput = this.shadowRoot?.getElementById('edit-price')

      if (nameInput instanceof HTMLInputElement) nameInput.value = item.name
      if (lvlInput instanceof HTMLInputElement) lvlInput.value = String(item.lvl)
      if (priceInput instanceof HTMLInputElement) priceInput.value = String(item.price)

      // Show this form
      this.style.display = 'block'

      // Scroll to this component so user sees the edit form
      this.scrollIntoView({ behavior: 'smooth' })
    }

    document.addEventListener('populate-edit', onPopulate)

    /**
     * @type {HTMLFormElement | null | undefined}
     */
    const form = this.shadowRoot?.querySelector('#enchantment-edit-form')
    const cancelBtn = this.shadowRoot?.querySelector('#cancel-btn')

    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault()
        /** @type {HTMLInputElement | null | undefined} */
        const nameInput = this.shadowRoot?.querySelector('#edit-name')
        /** @type {HTMLInputElement | null | undefined} */
        const lvlInput = this.shadowRoot?.querySelector('#edit-level')
        /** @type {HTMLInputElement | null | undefined} */
        const priceInput = this.shadowRoot?.querySelector('#edit-price')

        if (!nameInput || !lvlInput || !priceInput) return

        const detail = {
          index: this._editingIndex,
          data: {
            name: nameInput.value,
            lvl: parseInt(lvlInput.value, 10) || 0,
            price: parseInt(priceInput.value, 10) || 0,
          },
        }

        this.dispatchEvent(
          new CustomEvent('save-enchantment', { detail, bubbles: true, composed: true }),
        )

        form.reset()
        this._editingIndex = -1
        // Hide edit form and show add form
        this.style.display = 'none'
        document.dispatchEvent(new CustomEvent('cancel-edit', { bubbles: true, composed: true }))
      })
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this._editingIndex = -1
        this.style.display = 'none'
        document.dispatchEvent(new CustomEvent('cancel-edit', { bubbles: true, composed: true }))
      })
    }
  }

  render() {
    this.shadowRoot?.setHTMLUnsafe(/* html */ `
      <div class="form-container">
        <h2 id="form-title">✏️ Editar Encantamiento</h2>
        <form id="enchantment-edit-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="edit-name">Nombre del Encantamiento</label>
              <input type="text" name="edit-name" id="edit-name" />
            </div>
            <div class="form-group">
              <label for="edit-level">Nivel del Encantamiento</label>
              <input type="number" name="edit-level" id="edit-level" />
            </div>
            <div class="form-group">
              <label for="edit-price">Precio del Encantamiento</label>
              <input type="number" name="edit-price" id="edit-price" />
            </div>
          </div>
          <div class="button-group">
            <button type="submit" class="btn-save" id="save-btn">
              Guardar Encantamiento
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
