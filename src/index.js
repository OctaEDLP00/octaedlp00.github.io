import { EnchantmentsDB } from './EnchantmentsDB.js';

class EnchantmentsTable extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.enchantmentsDB = new EnchantmentsDB('enchantments');
    this.editingIndex = -1;
  }

  async connectedCallback() {
    /** @type {string} */
    this.jsonUrl = this.getAttribute('data-json') || 'enchantments.json';
    await this.loadData();
    this.render();
    this.attachEventListeners();
  }

  async loadData() {
    await this.enchantmentsDB.initialize(this.jsonUrl);
  }

  static get styles() {
    return /* css */`
      :host {
        display: block;
      }

      .form-container {
        margin-bottom: 30px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 10px;
        border: 2px solid #e9ecef;
      }

      .form-container h2 {
        color: #495057;
        margin-bottom: 20px;
        font-size: 1.5rem;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-bottom: 15px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
      }

      label {
        font-weight: 600;
        margin-bottom: 5px;
        color: #495057;
        font-size: 0.9rem;
      }

      input {
        padding: 10px;
        border: 2px solid #dee2e6;
        border-radius: 5px;
        font-size: 1rem;
        transition: border-color 0.3s;
      }

      input:focus {
        outline: none;
        border-color: #667eea;
      }

      .button-group {
        display: flex;
        gap: 10px;
        margin-top: 15px;
      }

      button {
        padding: 12px 25px;
        border: none;
        border-radius: 5px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
      }

      .btn-add {
        background: #28a745;
        color: white;
      }

      .btn-add:hover {
        background: #218838;
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(40,167,69,0.3);
      }

      .btn-cancel {
        background: #6c757d;
        color: white;
        display: none;
      }

      .btn-cancel:hover {
        background: #5a6268;
      }

      .data-controls {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-bottom: 20px;
      }

      .btn-export,
      .btn-import {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
      }

      .btn-export {
        background: #17a2b8;
        color: white;
      }

      .btn-export:hover {
        background: #138496;
        transform: translateY(-2px);
      }

      .btn-import {
        background: #6f42c1;
        color: white;
      }

      .btn-import:hover {
        background: #5a32a3;
        transform: translateY(-2px);
      }

      .table-container {
        overflow-x: auto;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }

      thead {
        background: #667eea;
        color: white;
      }

      th {
        padding: 15px;
        text-align: left;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.85rem;
        letter-spacing: 1px;
      }

      tbody tr {
        border-bottom: 1px solid #dee2e6;
        transition: background-color 0.2s;
      }

      tbody tr:hover {
        background: #f8f9fa;
      }

      td {
        padding: 15px;
        color: #495057;
      }

      .action-buttons {
        display: flex;
        gap: 10px;
      }

      .btn-edit {
        background: #ffc107;
        color: #000;
        padding: 8px 15px;
        border-radius: 5px;
        font-size: 0.85rem;
      }

      .btn-edit:hover {
        background: #e0a800;
      }

      .btn-delete {
        background: #dc3545;
        color: white;
        padding: 8px 15px;
        border-radius: 5px;
        font-size: 0.85rem;
      }

      .btn-delete:hover {
        background: #c82333;
      }

      .empty-state {
        text-align: center;
        padding: 40px;
        color: #6c757d;
      }

      .empty-state p {
        font-size: 1.1rem;
        margin-bottom: 10px;
      }

      @media (max-width: 768px) {
        .form-grid {
          grid-template-columns: 1fr;
        }

        table {
          font-size: 0.9rem;
        }

        th, td {
          padding: 10px;
        }
      }
    `
  }

  render() {
    // @ts-ignore
    this.shadowRoot?.setHTMLUnsafe(/* html */`
      <style>${EnchantmentsTable.styles}</style>
      <div class="data-controls">
        <button class="btn-import" id="import-btn">Importar JSON</button>
        <button class="btn-export" id="export-btn">Exportar JSON</button>
      </div>

      <div class="form-container">
        <h2 id="form-title">✨ Agregar Nuevo Encantamiento</h2>
        <form id="enchantment-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="enchantment-name">Nombre del Encantamiento</label>
              <input type="text" id="enchantment-name" required placeholder="Ej: Protección, Filo, Fortuna...">
            </div>

            <div class="form-group">
              <label for="level">Nivel</label>
              <input type="number" id="level" min="1" max="10" required placeholder="Ej: 1, 2, 3, 4...">
            </div>

            <div class="form-group">
              <label for="price">Precio</label>
              <input type="text" id="price" required placeholder="Ej: 10 esmeraldas, 5 diamantes...">
            </div>
          </div>

          <div class="button-group">
            <button type="submit" class="btn-add" id="submit-btn">Agregar Encantamiento</button>
            <button type="button" class="btn-cancel" id="cancel-btn">Cancelar</button>
          </div>
        </form>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Nombre del Encantamiento</th>
              <th>Nivel</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="table-body"></tbody>
        </table>
      </div>
    `);

    this.renderTableRows();
  }

  renderTableRows() {
    const tableBody = this.shadowRoot?.getElementById('table-body');
    const enchantments = this.enchantmentsDB.getAll();

    if (enchantments.length === 0) {
      // @ts-ignore
      tableBody?.setHTMLUnsafe(/* html */`
        <tr class="empty-state">
          <td colspan="4">
            <p>📦 No hay encantamientos registrados</p>
            <small>Agrega tu primer encantamiento usando el formulario arriba</small>
          </td>
        </tr>
      `);
      return;
    }

    // @ts-ignore
    tableBody?.setHTMLUnsafe(enchantments.map((item, index) => /* html */`
      <tr>
        <td><strong>${item.name}</strong></td>
        <td>${item.lvl}</td>
        <td>${item.price}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-edit" data-index="${index}">Editar</button>
            <button class="btn-delete" data-index="${index}">Eliminar</button>
          </div>
        </td>
      </tr>
    `).join(''));
  }

  attachEventListeners() {
    /**
     * @type {HTMLFormElement | null | undefined}
     */
    const form = this.shadowRoot?.querySelector('#enchantment-form');
    /**
     * @type {HTMLButtonElement | null | undefined}
     */
    const submitBtn = this.shadowRoot?.querySelector('#submit-btn');
    /**
     * @type {HTMLButtonElement | null | undefined}
     */
    const cancelBtn = this.shadowRoot?.querySelector('#cancel-btn');
    const formTitle = this.shadowRoot?.querySelector('#form-title');
    /**
     * @type {HTMLButtonElement | null | undefined}
     */
    const exportBtn = this.shadowRoot?.querySelector('#export-btn');
    /**
     * @type {HTMLButtonElement | null | undefined}
     */
    const importBtn = this.shadowRoot?.querySelector('#import-btn');

    if (form == null) return
    if (submitBtn == null) return
    if (cancelBtn == null) return
    if (formTitle == null) return
    if (exportBtn == null) return
    if (importBtn == null) return

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      /**
       * @type {HTMLInputElement}
      */
      // @ts-ignore-error
      const name = this.shadowRoot?.getElementById('enchantment-name')
      /**
       * @type {HTMLInputElement}
      */
      // @ts-ignore-error
      const lvl = this.shadowRoot?.getElementById('level')
      /**
       * @type {HTMLInputElement}
      */
      // @ts-ignore-error
      const price = this.shadowRoot?.getElementById('price')

      if (name == null) return
      if (lvl == null) return
      if (price == null) return

      const enchantmentData = {
        name: name.value,
        lvl: parseInt(lvl.value),
        price: parseInt(price.value)
      };

      if (this.editingIndex >= 0) {
        this.enchantmentsDB.update(this.editingIndex, enchantmentData);
        this.editingIndex = -1;
        // @ts-ignore
        submitBtn?.textContent = 'Agregar Encantamiento';
        // @ts-ignore
        submitBtn?.className = 'btn-add';
        // @ts-ignore
        cancelBtn?.style.display = 'none';
        // @ts-ignore
        formTitle?.textContent = '✨ Agregar Nuevo Encantamiento';
      } else {
        this.enchantmentsDB.add(enchantmentData);
      }

      form.reset();
      this.renderTableRows();
    });

    cancelBtn.addEventListener('click', () => {
      this.editingIndex = -1;
      form.reset();
      submitBtn.textContent = 'Agregar Encantamiento';
      submitBtn.className = 'btn-add';
      cancelBtn.style.display = 'none';
      formTitle.textContent = '✨ Agregar Nuevo Encantamiento';
    });

    /** @type {HTMLTableSectionElement | null | undefined} */
    const tableBody = this.shadowRoot?.querySelector('#table-body');

    if (tableBody == null) return

    tableBody.addEventListener('click', (/** @type {MouseEvent} */e) => {
      const target = /** @type {HTMLElement} */ (e.target);
      // Verificar si el target es un botón y tiene el atributo data-index
      if (target instanceof HTMLButtonElement && target.hasAttribute('data-index')) {
        const index = parseInt(target.dataset.index || '-1');

        if (target.classList.contains('btn-edit')) {
          this.editItem(index);
        } else if (target.classList.contains('btn-delete')) {
          this.deleteItem(index);
        }
      }
    });

    exportBtn.addEventListener('click', () => this.enchantmentsDB.downloadJSON());
    importBtn.addEventListener('click', async () => {
      try {
        await this.enchantmentsDB.uploadJSON();
        this.renderTableRows();
      } catch (error) {
        alert('Error al importar el archivo JSON');
        console.error(error);
      }
    });
  }

  /**
   * @param {number} index
   */
  editItem(index) {
    this.editingIndex = index;
    const item = this.enchantmentsDB.getById(index);

    if (!item) return;

    /**
     * @type {HTMLInputElement | null | undefined}
     */
    const inputName = this.shadowRoot?.querySelector('#enchantment-name')
    /**
     * @type {HTMLInputElement | null | undefined}
     */
    const inputLvl = this.shadowRoot?.querySelector('#level')
    /**
     * @type {HTMLInputElement | null | undefined}
     */
    const inputPrice = this.shadowRoot?.querySelector('#price')

    if (inputName == null) return
    if (inputLvl == null) return
    if (inputPrice == null) return

    inputName.value = item.name;
    inputLvl.value = item.lvl.toString();
    inputPrice.value = item.price.toString();

    /** @type {HTMLButtonElement | null | undefined} */
    const submitBtn = this.shadowRoot?.querySelector('#submit-btn');
    /** @type {HTMLButtonElement | null | undefined} */
    const cancelBtn = this.shadowRoot?.querySelector('#cancel-btn');
    /** @type {HTMLElement | null | undefined} */
    const formTitle = this.shadowRoot?.querySelector('#form-title');

    if (submitBtn == null) return
    if (cancelBtn == null) return
    if (formTitle == null) return

    submitBtn.textContent = 'Guardar Cambios';
    submitBtn.className = 'btn-add';
    cancelBtn.style.display = 'inline-block';
    formTitle.textContent = '✏️ Editar Encantamiento';

    this.scrollIntoView({ behavior: 'smooth' });
  }

  /**
   * @param {number} index
   */
  deleteItem(index) {
    if (confirm('¿Estás seguro de eliminar este encantamiento?')) {
      this.enchantmentsDB.delete(index);
      this.renderTableRows();
    }
  }
}

customElements.define('enchantments-table', EnchantmentsTable);
