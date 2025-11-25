import loaderCss from '../lib/loaderCss.js'
import { EnchantmentsDB } from '../modules/EnchantmentsDB.js'
import css from './styles/enchantments-table.css?raw'

export class EnchantmentsTable extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.enchantmentsDB = new EnchantmentsDB()
    this.editingIndex = -1
    this._dragCounter = 0
    this.init()
  }

  init() {
    /** @type {'name' | 'lvl' | 'price'} */
    this._sortColumn = 'name' // Column to sort by
    /** @type {'asc' | 'desc'} */
    this._sortOrder = 'asc' // 'asc' or 'desc'
  }

  async connectedCallback() {
    /** @type {string | undefined} */
    this.file = this.getAttribute('data-json') || 'enchantments'
    await this.loadData()
    this.render()
    this.attachEventListeners()
  }

  async loadData() {
    await this.enchantmentsDB.initialize(this.file)
  }

  attachEventListeners() {
    const exportBtn = document.querySelector('#export-btn')
    const importBtn = document.querySelector('#import-btn')

    if (exportBtn instanceof HTMLButtonElement) {
      exportBtn.addEventListener('click', () => this.enchantmentsDB.downloadJSON())
    }
    if (importBtn instanceof HTMLButtonElement) {
      importBtn.addEventListener('click', async () => {
        try {
          await this.enchantmentsDB.uploadJSON()
          this.renderTableRows()
        } catch (error) {
          alert('Error al importar el archivo JSON')
          console.error(error)
        }
      })
    }

    // Listen to events dispatched by the add/edit form components.
    document.addEventListener('add-enchantment', (/** @type {Event} */ e) => {
      const ev = /** @type {CustomEvent} */ (e)
      const detail = ev.detail
      if (!detail) return
      this.enchantmentsDB.add(detail)
      this.renderTableRows()
      this.showAlert('✅ Encantamiento agregado', 'success')
    })

    document.addEventListener('save-enchantment', (/** @type {Event} */ e) => {
      const ev = /** @type {CustomEvent} */ (e)
      const detail = ev.detail || {}
      const index = detail.index
      const data = detail.data
      if (typeof index !== 'number' || !data) return
      this.enchantmentsDB.update(index, data)
      this.renderTableRows()
      this.showAlert('✅ Cambios guardados', 'success')
    })

    /** @type {HTMLTableSectionElement | null | undefined} */
    const tableBody = this.shadowRoot?.querySelector('#table-body')

    if (tableBody == null) return

    tableBody.addEventListener('click', (/** @type {MouseEvent} */ e) => {
      const target = /** @type {HTMLElement} */ (e.target)
      // Check button or parent button (for SVG icons inside)
      const button = target instanceof HTMLButtonElement ? target : target.closest('button')
      if (button && button.hasAttribute('data-item-name')) {
        const itemName = button.dataset.itemName || ''
        // Find the actual index in the original array
        const allItems = this.enchantmentsDB.getAll()
        const index = allItems.findIndex(item => item.name === itemName)
        if (index === -1) return

        if (button.classList.contains('btn-edit')) {
          this.editItem(index)
        } else if (button.classList.contains('btn-delete')) {
          this.deleteItem(index)
        }
      }
    })
    // Drag and Drop functionality
    this.setupDragAndDrop()
  }

  /** Configura los eventos de drag and drop para la zona de carga */
  setupDragAndDrop() {
    /**
     * @type {HTMLTableElement | undefined | null}
     */
    const tableContainer = this.shadowRoot?.querySelector('#table-container')
    if (!tableContainer) return

    // Create an overlay element for clearer visual feedback
    let overlay = this.shadowRoot?.getElementById('drop-overlay')
    if (!overlay) {
      overlay = document.createElement('div')
      overlay.id = 'drop-overlay'
      overlay.className = 'drop-overlay'
      overlay.innerHTML = `
        <div class="drop-inner">
          <div class="drop-icon">📁</div>
          <div class="drop-text">Suelta tu archivo JSON aquí</div>
          <div id="drop-filename" class="drop-filename"></div>
        </div>
      `
      tableContainer.appendChild(overlay)
    }

    /**
     *
     * @param {*} message
     */
    const showOverlay = message => {
      overlay.classList.add('visible')
      const txt = overlay.querySelector('.drop-text')
      if (txt) txt.textContent = message
    }

    /**
     *
     */
    const hideOverlay = () => {
      overlay.classList.remove('visible')
      const fname = overlay.querySelector('#drop-filename')
      if (fname) fname.textContent = ''
    }

    /**
     * Helper to validate a file is JSON by MIME or extension
     * @param {*} file
     * @returns
     */
    const isJsonFile = file => {
      if (!file) return false
      if (file.type && file.type.indexOf('json') !== -1) return true
      return file.name && file.name.toLowerCase().endsWith('.json')
    }

    // Use dragenter/leave counter to avoid flicker when overlay is inserted
    tableContainer.addEventListener('dragenter', e => {
      e.preventDefault()
      e.stopPropagation()
      this._dragCounter++
      showOverlay('Suelta para importar (.json)')
    })

    tableContainer.addEventListener('dragover', e => {
      e.preventDefault()
      e.dataTransfer && (e.dataTransfer.dropEffect = 'copy')
    })

    tableContainer.addEventListener('dragleave', e => {
      e.preventDefault()
      e.stopPropagation()
      this._dragCounter--
      if (this._dragCounter <= 0) {
        this._dragCounter = 0
        hideOverlay()
      }
    })

    tableContainer.addEventListener('drop', e => {
      e.preventDefault()
      e.stopPropagation()
      this._dragCounter = 0
      hideOverlay()

      const files = e.dataTransfer?.files
      if (files && files.length > 0) {
        const file = files[0]
        const fnameEl = overlay.querySelector('#drop-filename')
        if (fnameEl) fnameEl.textContent = file.name

        if (!isJsonFile(file)) {
          this.showAlert('❌ Solo se aceptan archivos .json', 'error')
          return
        }

        if (files.length > 1) {
          this.showAlert('⚠️ Se subieron varios archivos; se procesará el primero', 'error')
        }

        this.handleFileUpload(file)
      }
    })

    // Click on the table container to select a file (accessible fallback)
    // Only open when clicking the container background — not on the table rows or buttons
    tableContainer.addEventListener('click', e => {
      const target = /** @type {HTMLElement} */ (e.target)
      // If clicked inside interactive elements (buttons, table cells, icons), do nothing
      if (
        target.closest &&
        target.closest(
          'button, a, input, select, textarea, svg, path, table, td, th, .action-buttons',
        )
      )
        return
      // Also only open when clicking the container itself (background)
      if (target !== tableContainer) return

      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'application/json'
      input.addEventListener('change', e => {
        const target = /** @type {HTMLInputElement} */ (e.target)
        if (target.files && target.files.length > 0) {
          const file = target.files[0]
          if (!isJsonFile(file)) {
            this.showAlert('❌ Solo se aceptan archivos .json', 'error')
            return
          }
          this.handleFileUpload(file)
        }
      })
      input.click()
    })
  }

  /**
   * Muestra un mensaje de alerta como notificación fija en la página (fuera del shadow DOM)
   * @param {string} message
   * @param {"success" | "error"} type
   */
  showAlert(message, type) {
    // Crear o reutilizar un contenedor en el body
    let alertContainer = document.getElementById('global-alert-container')
    if (!alertContainer) {
      alertContainer = document.createElement('div')
      alertContainer.id = 'global-alert-container'
      alertContainer.className = 'global-alert-container'
      document.body.appendChild(alertContainer)
    }

    const alert = document.createElement('div')
    alert.className = `alert alert-${type} show`
    alert.textContent = message
    alertContainer.appendChild(alert)

    // Desaparecer después de 4 segundos
    setTimeout(() => {
      alert.classList.remove('show')
      setTimeout(() => alert.remove(), 300)
    }, 4000)
  }

  /**
   * Maneja la carga del archivo JSON con validación de Zod
   * @param {File} file
   */
  async handleFileUpload(file) {
    try {
      const text = await file.text()
      const json = JSON.parse(text)

      // Usar el método uploadJSON del DB que tiene validación con Zod
      const result = this.enchantmentsDB.importJSON(json)

      if (result) {
        this.showAlert('✅ Archivo importado correctamente', 'success')
        this.renderTableRows()
      } else {
        this.showAlert('❌ El archivo no tiene el formato correcto', 'error')
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        this.showAlert('❌ El archivo no es un JSON válido', 'error')
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Desconocido'
        this.showAlert(`❌ Error al procesar el archivo: ${errorMessage}`, 'error')
      }
      console.error('Error en handleFileUpload:', error)
    }
  }

  /** @param {number} index */
  editItem(index) {
    const item = this.enchantmentsDB.getById(index)
    if (!item) return

    // Ask the edit form to populate with this item
    document.dispatchEvent(
      new CustomEvent('populate-edit', {
        detail: { index, item },
        bubbles: true,
        composed: true,
      }),
    )

    // Dispatch event to toggle form visibility (hide add, show edit)
    document.dispatchEvent(
      new CustomEvent('show-edit-form', {
        bubbles: true,
        composed: true,
      }),
    )

    // Scroll to the edit form so the user sees it
    const editForm = document.querySelector('edit-form')
    if (editForm instanceof HTMLElement) editForm.scrollIntoView({ behavior: 'smooth' })
  }

  /** @param {number} index */
  deleteItem(index) {
    if (confirm('¿Estás seguro de eliminar este encantamiento?')) {
      this.enchantmentsDB.delete(index)
      this.renderTableRows()
    }
  }

  render() {
    // @ts-ignore
    this.shadowRoot?.setHTMLUnsafe(/* html */ `
      <div id="alert-container" class="alert"></div>
      <div class="table-container" id="table-container">
        <table>
          <thead>
            <tr>
              <th class="sortable-header" data-column="name">Nombre del Encantamiento <span class="sort-icon">⬆</span></th>
              <th class="sortable-header" data-column="lvl">Nivel <span class="sort-icon"></span></th>
              <th class="sortable-header" data-column="price">Precio <span class="sort-icon"></span></th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="table-body"></tbody>
        </table>
      </div>
    `)
    this.renderTableRows()
    this.setupHeaderSort()
    this.shadowRoot?.adoptedStyleSheets.push(loaderCss(css))
  }

  setupHeaderSort() {
    const headers = this.shadowRoot?.querySelectorAll('.sortable-header')
    headers?.forEach(header => {
      header.addEventListener('click', () => {
        const column = header.getAttribute('data-column')
        if (!column) return

        // Toggle sort order if same column, else set to asc
        if (this._sortColumn === column) {
          this._sortOrder = this._sortOrder === 'asc' ? 'desc' : 'asc'
        } else {
          // @ts-ignore
          this._sortColumn = column
          this._sortOrder = 'asc'
        }

        // Update visual indicators - mostrar icon solo en la columna ordenada
        const allHeaders = this.shadowRoot?.querySelectorAll('.sortable-header')
        allHeaders?.forEach(h => {
          const icon = h.querySelector('.sort-icon')
          const headerColumn = h.getAttribute('data-column')
          if (headerColumn === this._sortColumn) {
            // Mostrar el icono con dirección en la columna actualmente ordenada
            if (icon) icon.textContent = this._sortOrder === 'asc' ? '⬆' : '⬇'
          } else {
            // Ocultar el icono en las otras columnas
            if (icon) icon.textContent = ''
          }
        })

        this.renderTableRows()
      })
    })
  }

  renderTableRows() {
    const tableBody = this.shadowRoot?.querySelector('#table-body')
    let enchantments = this.enchantmentsDB.getAll()

    // Sort enchantments based on current sort settings
    enchantments = this.sortEnchantments(enchantments)

    if (enchantments.length === 0) {
      // @ts-ignore
      tableBody?.setHTMLUnsafe(/* html */ `
        <tr class="empty-state">
          <td colspan="4">
            <p>📦 No hay encantamientos registrados</p>
            <small>Agrega tu primer encantamiento usando el formulario arriba o arrastrando un archivo en la tabla</small>
          </td>
        </tr>
      `)
      return
    }

    // @ts-ignore
    tableBody?.setHTMLUnsafe(
      enchantments
        .map(
          item => /* html */ `<tr>
          <td><strong>${item.name}</strong></td>
          <td>${item.lvl}</td>
          <td>${item.price} Esmeraldas</td>
          <td>
            <div class="action-buttons">
              <button class="btn-edit" data-item-name="${item.name}">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>
                  <path d="m15 5 4 4"/>
                </svg>
              </button>
              <button class="btn-delete" data-item-name="${item.name}">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M10 5a2 2 0 0 0-1.344.519l-6.328 5.74a1 1 0 0 0 0 1.481l6.328 5.741A2 2 0 0 0 10 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"/>
                  <path d="m12 9 6 6"/>
                  <path d="m18 9-6 6"/>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `,
        )
        .join(''),
    )
  }

  /**
   * Sorts enchantments array based on current sort settings
   * @param {any[]} enchantments
   * @returns {any[]}
   */
  sortEnchantments(enchantments) {
    const sorted = [...enchantments]
    sorted.sort((a, b) => {
      // @ts-ignore
      let aVal = a[this._sortColumn]
      // @ts-ignore
      let bVal = b[this._sortColumn]

      // Handle string comparisons
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
        return this._sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }

      // Handle numeric comparisons
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return this._sortOrder === 'asc' ? aVal - bVal : bVal - aVal
      }

      return 0
    })
    return sorted
  }
}
