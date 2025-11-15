export class EnchantmentsDB {
  constructor(storageKey = 'enchantments') {
    this.storageKey = storageKey;
    /** @type {import('./index.d.mjs').Enchantments} */
    this.enchanments = [];
  }

  /**
   * @param {string | null} jsonUrl
   * @returns {Promise<import('./index.d.mjs').Enchantments>}
   */
  async initialize(jsonUrl = null) {
    try {
      const localData = localStorage.getItem(this.storageKey);

      if (localData) {
        this.enchanments = JSON.parse(localData);
      } else if (jsonUrl) {
        const response = await fetch(`/${jsonUrl}`);
        if (response.ok) {
          const json = await response.json();
          this.enchanments = json.enchantments || [];
          this.save();
        }
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      this.enchanments = [];
    }

    return this.enchanments;
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.enchanments));
  }

  getAll() {
    return [...this.enchanments];
  }

  /**
   * @param {*} index
   * @returns
   */
  getById(index) {
    return this.enchanments[index] ? { ...this.enchanments[index] } : null;
  }

  /**
   *
   * @param {import('./index.d.mjs').Enchantment} enchantment
   * @returns {import('./index.d.mjs').Enchantment}
   */
  add({ lvl, price, name }) {
    const newItem = {
      name,
      lvl,
      price
    };

    this.enchanments.push(newItem);
    this.save();

    return newItem;
  }

  /**
   *
   * @param {number} index
   * @param {import('./index.d.mjs').Enchantment} enchantment
   * @returns {boolean}
   */
  update(index, { name, lvl, price }) {
    if (index >= 0 && index < this.enchanments.length) {
      this.enchanments[index] = {
        name,
        lvl,
        price
      };
      this.save();
      return true;
    }
    return false;
  }

  /**
 * @param {number} index
 * @param {Object} config
 * @param {string} [config.name]
 * @param {number} [config.lvl]
 * @param {number} [config.price]
 * @returns {boolean}
 */
  updateField(index, config) {
    if (index >= 0 && index < this.enchanments.length) {
      const item = this.enchanments[index];

      if (config.name !== undefined) item.name = config.name;
      if (config.lvl !== undefined) item.lvl = config.lvl;
      if (config.price !== undefined) item.price = config.price;

      this.save();
      return true;
    }
    return false;
  }

  /**
   * @param {number} index
   * @param {Partial<import('./index.d.mjs').Enchantment>} updates
   * @returns {boolean}
   */
  updatePartial(index, updates) {
    if (index >= 0 && index < this.enchanments.length) {
      const item = this.enchanments[index];

      if (updates.name !== undefined) {
        item.name = updates.name;
      }
      if (updates.lvl !== undefined) {
        item.lvl = updates.lvl;
      }
      if (updates.price !== undefined) {
        item.price = updates.price;
      }

      this.save();
      return true;
    }
    return false;
  }

  /**
   * @param {number} index
   * @returns {boolean}
   */
  delete(index) {
    if (index >= 0 && index < this.enchanments.length) {
      this.enchanments.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  clear() {
    this.enchanments = [];
    this.save();
  }

  exportJSON() {
    return {
      enchantments: this.enchanments
    };
  }

  /**
   *
   * @param {{enchantments: import('./index.d.mjs').Enchantments}} json
   * @returns
   */
  importJSON(json) {
    try {
      if (json.enchantments && Array.isArray(json.enchantments)) {
        this.enchanments = json.enchantments;
        this.save();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing JSON:', error);
      return false;
    }
  }

  downloadJSON(filename = 'enchantments.json') {
    const dataStr = JSON.stringify(this.exportJSON(), null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  uploadJSON() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';

      input.addEventListener('change', async (e) => {
        const target = /** @type {HTMLInputElement} */ (e.target);
        const file = target.files?.[0];

        if (file) {
          try {
            const text = await file.text();
            const json = JSON.parse(text);

            if (this.importJSON(json)) {
              resolve(this.enchanments);
            } else {
              reject(new Error('Invalid JSON format'));
            }
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error('No file selected'));
        }
      });

      input.click();
    });
  }
}
