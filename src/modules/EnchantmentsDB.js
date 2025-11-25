import { ZodError } from 'zod'
import { enchantmentsJsonSchema } from '../schema/index.js'

const { log, error, debug } = console

export class EnchantmentsDB {
  constructor() {
    /** @type {import('../index.d.mjs').Enchantments} */
    this.enchantments = []
  }

  /**
   * @param {string | null} file
   * @returns {Promise<import('../index.d.mjs').Enchantments>}
   */
  async initialize(file = null) {
    try {
      if (file) {
        const response = await fetch(`/${file}.json`)
        if (response.ok) {
          const json = await response.json()
          log(json)
          const result = enchantmentsJsonSchema.safeParse(json)
          if (!result.success) {
            error('Error de validación en JSON importado:', result.error?.message)
            this.enchantments = []
          } else {
            this.enchantments = result.data.enchantments
            this.save()
          }
        }
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        error(err)
      } else if (err instanceof Error) {
        error('Error initializing database:', err.message)
      } else {
        error(err)
      }
      this.enchantments = []
    }

    return this.enchantments
  }

  save() {
    this.syncToFile()
  }

  /**
   * Sincroniza los datos con el archivo public/enchantments.json
   * @private
   */
  async syncToFile() {
    try {
      const data = this.exportJSON()
      const response = await fetch('/enchantments.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).catch(() => null)

      if (response && response.ok) {
        log('Encantamientos sincronizados con el servidor')
      }
    } catch (error) {
      debug('API de sincronización no disponible. Los datos se guardan solo en localStorage.')
    }
  }

  getAll() {
    // Return a shallow copy to avoid external mutation
    return Array.isArray(this.enchantments) ? [...this.enchantments] : []
  }

  /**
   * @param {number} index
   * @returns {import('../index.d.mjs').Enchantment | null}
   */
  getById(index) {
    return this.enchantments?.[index] ? { ...this.enchantments[index] } : null
  }

  /**
   * @param {import('../index.d.mjs').Enchantment} enchantment
   * @returns {import('../index.d.mjs').Enchantment}
   */
  add({ lvl, price, name }) {
    const newItem = {
      name,
      lvl,
      price,
    }
    try {
      if (this.enchantments) {
        this.enchantments.push(newItem)
        this.save()
      }
    } catch {
      error('Error al agregar el nuevo item', newItem)
    }

    return newItem
  }

  /**
   * @param {number} index
   * @param {import('../index.d.mjs').Enchantment} enchantment
   * @returns {boolean}
   */
  update(index, { name, lvl, price }) {
    if (index >= 0 && Array.isArray(this.enchantments) && index < this.enchantments.length) {
      this.enchantments[index] = { name, lvl, price }
      this.save()
      return true
    }
    return false
  }

  /**
   * @param {number} index
   * @param {Partial<import('../index.d.mjs').Enchantment>} config
   * @returns {boolean}
   */
  updateField(index, config) {
    if (index >= 0 && Array.isArray(this.enchantments) && index < this.enchantments.length) {
      const item = this.enchantments[index]

      if (config.name !== undefined) item.name = config.name
      if (config.lvl !== undefined) item.lvl = config.lvl
      if (config.price !== undefined) item.price = config.price

      this.save()
      return true
    }
    return false
  }

  /**
   * @param {number} index
   * @param {Partial<import('../index.d.mjs').Enchantment>} updates
   * @returns {boolean}
   */
  updatePartial(index, updates) {
    if (index >= 0 && Array.isArray(this.enchantments) && index < this.enchantments.length) {
      const item = this.enchantments[index]

      if (updates.name !== undefined) {
        item.name = updates.name
      }
      if (updates.lvl !== undefined) {
        item.lvl = updates.lvl
      }
      if (updates.price !== undefined) {
        item.price = updates.price
      }

      this.save()
      return true
    }
    return false
  }

  /**
   * @param {number} index
   * @returns {boolean}
   */
  delete(index) {
    if (index >= 0 && Array.isArray(this.enchantments) && index < this.enchantments.length) {
      this.enchantments.splice(index, 1)
      this.save()
      return true
    }
    return false
  }

  clear() {
    this.enchantments = []
    this.save()
  }

  exportJSON() {
    return {
      enchantments: this.enchantments,
    }
  }

  /**
   * @param {{ enchantments: import('../index.d.mjs').Enchantments }} json
   * @returns
   */
  importJSON(json) {
    try {
      const result = enchantmentsJsonSchema.safeParse(json)

      if (result.success) {
        this.enchantments = result.data.enchantments
        this.save()
        return true
      } else {
        error('Error de validación en importJSON:', result.error.format())
        return false
      }
    } catch (err) {
      error('Error importing JSON:', err)
      return false
    }
  }

  downloadJSON(filename = 'enchantments') {
    const dataStr = JSON.stringify(this.exportJSON(), null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  /**
   * Actualiza el archivo enchantments.json en la carpeta public
   * Descarga automáticamente el archivo para reemplazarlo manualmente
   * o se sincroniza con el servidor si la API está disponible
   * @param {string} filename
   */
  updatePublicFile(filename = 'enchantments') {
    this.downloadJSON(filename)
    log('Descargando archivo actualizado. Reemplaza el archivo en public/enchantments.json')
  }

  uploadJSON() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'application/json'

      input.addEventListener('change', async e => {
        const target = /** @type {HTMLInputElement} */ (e.target)
        const file = target.files?.[0]

        if (file) {
          try {
            const text = await file.text()
            const json = JSON.parse(text)
            const result = enchantmentsJsonSchema.safeParse(json)

            if (!result.success) {
              reject(new Error(`Formato JSON inválido`))
              return
            }

            this.enchantments = result.data.enchantments
            this.save()
            resolve(this.enchantments)
          } catch (error) {
            if (error instanceof SyntaxError) {
              reject(new Error('El archivo no es un JSON válido'))
            }
            reject(error)
          }
        } else {
          reject(new Error('No file selected'))
        }
      })

      input.click()
    })
  }
}
