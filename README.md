# octaedlp00.github.io

Pequeña aplicación estática para gestionar una lista de encantamientos.

Características principales
- **Validación runtime:** usa `zod` (local bundle `zod-local`) para validar cada encantamiento y el JSON importado.
- **Validación por encantamiento:** cada encantamiento tiene rango de nivel (`minLvl`/`maxLvl`) definido en `src/const.js`; la app impide niveles fuera de rango (p. ej. `Fortune 4` si el máximo es 3).
- **Importar JSON:** soporte para arrastrar y soltar un archivo JSON sobre la tabla o subirlo desde el diálogo de archivos. El JSON se valida antes de aplicarse.
- **Persistencia local:** los cambios se guardan en `localStorage`. Hay una tentativa de sincronización por POST y una opción para descargar el JSON actualizado para reemplazar manualmente `public/enchantments.json` cuando se publica en un host estático.
- **Constantes canónicas:** `src/const.js` contiene `EnchantmentNames` (lista con `id`, `name`, `minLvl`, `maxLvl`) y el diccionario exportado `EnchantmentIdNameMap` (id → name) usado por la validación y la UI.
- **Interfaz:** una tabla con formularios para añadir/editar/eliminar encantamientos y soporte drag & drop sobre la propia tabla.

Uso
- Abrir `index.html` en un navegador o servir el directorio con un servidor estático, por ejemplo:

```powershell
python -m http.server 8000
# luego abrir http://localhost:8000 en el navegador
```

- Para importar encantamientos:
	- Arrastra un archivo JSON válido sobre la tabla, o
	- Haz clic en la tabla para abrir el diálogo de archivos y selecciona un JSON.
	- El JSON debe tener la forma:

```json
{
	"enchantments": [
		{ "name": "fortune", "lvl": 3, "price": 5 }
	]
}
```

- Si la importación es válida, los datos se aplican y se guardan en `localStorage`.
- Para publicar cambios en `public/enchantments.json` en un repo estático (p. ej. GitHub Pages) descarga el JSON desde la UI y reemplaza manualmente el archivo en la rama `master`.

Notas para desarrolladores
- Archivos clave:
	- `src/index.js` — componente de la UI, renderizado y handlers (incluye drag & drop).
	- `src/EnchantmentsDB.js` — capa de datos: validación con Zod, import/export, persistencia.
	- `src/const.js` — lista canónica `EnchantmentNames` y diccionario `EnchantmentIdNameMap`.
	- `public/enchantments.json` — dataset por defecto (estático).

- Para cambiar los rangos válidos de niveles, edita `EnchantmentNames` en `src/const.js` y ajusta `minLvl`/`maxLvl` para cada entrada.
- La validación del campo `name` acepta tanto los `id` como los `name` definidos en `src/const.js`.

Limitaciones y notas
- Esta es una aplicación estática: no hay un backend incluido que escriba automáticamente en `public/enchantments.json`. La app intenta un POST por compatibilidad con un posible endpoint, pero en hosts estáticos debes reemplazar manualmente el archivo tras la descarga.
- Si quieres persistencia automática en el repositorio (commit automático), puedo añadir un ejemplo de endpoint Node.js o una GitHub Action que acepte el JSON y lo escriba en `public/enchantments.json`.

Contribuciones
- Pull requests y mejoras bienvenidas. Para cambios rápidos en los encantamientos edita `src/const.js` y prueba la UI en local.

---

Si quieres que añada autocompletado del campo `#enchantment-name` o que convierta automáticamente `id` → `name` al guardar, dime y lo implemento.

