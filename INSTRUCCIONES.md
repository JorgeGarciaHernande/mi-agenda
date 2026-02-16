# Mi Agenda - Instrucciones de Configuración

## 1. Abrir la página

Simplemente abre el archivo `index.html` en tu navegador (doble clic).

La página ya está conectada a tu Google Sheet y mostrará tu calendario de YouTube.

---

## 2. Configurar Bot de Telegram (5 minutos)

### Paso 1: Crear el bot
1. Abre Telegram y busca **@BotFather**
2. Escribe `/start`
3. Escribe `/newbot`
4. Te pedirá un nombre para tu bot (ej: "Mi Agenda Notificaciones")
5. Te pedirá un username (debe terminar en "bot", ej: "miagenda_2026_bot")
6. **Te dará un TOKEN** - cópialo, es algo como: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`

### Paso 2: Obtener tu Chat ID
1. **Primero**, busca tu bot en Telegram y envíale cualquier mensaje (ej: "hola")
2. Abre esta URL en tu navegador (reemplaza TU_TOKEN):
   ```
   https://api.telegram.org/botTU_TOKEN/getUpdates
   ```
3. Verás algo como esto:
   ```json
   {"result":[{"message":{"chat":{"id":123456789}}}]}
   ```
4. El número `123456789` es tu **Chat ID** - cópialo

### Paso 3: Configurar en la página
1. En la página, haz clic en el botón ⚙️ (esquina inferior derecha)
2. Pega tu **Token** y tu **Chat ID**
3. Guarda - te llegará un mensaje de prueba a Telegram

---

## 3. Configurar Google Apps Script (Opcional - para guardar en Sheet)

Si quieres que las tareas que agregues se guarden también en tu Google Sheet:

### Paso 1: Crear el script
1. Ve a [Google Apps Script](https://script.google.com/)
2. Clic en "Nuevo proyecto"
3. Borra el código existente y pega esto:

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // ID de tu Google Sheet (lo sacas de la URL de tu hoja)
    var sheetId = 'TU_SHEET_ID_AQUI';
    var sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Tareas Personalizadas');

    // Si no existe la hoja, crearla
    if (!sheet) {
      sheet = SpreadsheetApp.openById(sheetId).insertSheet('Tareas Personalizadas');
      sheet.appendRow(['Fecha', 'Hora', 'Descripción', 'Prioridad', 'Creada']);
    }

    // Agregar la tarea
    sheet.appendRow([
      data.date,
      data.time,
      data.description,
      data.priority,
      new Date()
    ]);

    return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput('API funcionando');
}
```

### Paso 2: Obtener el Sheet ID
Tu URL de Google Sheet es:
```
https://docs.google.com/spreadsheets/d/XXXXX/edit
```
El XXXXX es tu Sheet ID. En tu caso, necesitas el ID del spreadsheet original (no el publicado).

### Paso 3: Implementar
1. En Apps Script, ve a **Implementar > Nueva implementación**
2. Tipo: **Aplicación web**
3. Ejecutar como: **Yo**
4. Quién tiene acceso: **Cualquier persona**
5. Clic en **Implementar**
6. Te dará una URL - cópiala
7. Pégala en la configuración de la página (botón ⚙️)

---

## 4. Usar la página

### Ver tareas
- Navega por los meses con las flechas
- Los días con **punto verde** tienen tareas
- Los días **morados** son días de subida de video
- Haz clic en un día para ver las tareas

### Agregar tareas
1. Clic en **"+ Agregar Tarea"**
2. Selecciona fecha, hora, descripción
3. Si es **Prioridad Alta**, te llegará notificación a Telegram
4. Guarda

---

## Solución de problemas

### No carga el calendario
- Verifica que tu Google Sheet esté publicado en la web
- Revisa la consola del navegador (F12) para ver errores

### No llegan notificaciones de Telegram
- Verifica que el token y chat ID sean correctos
- Asegúrate de haber enviado al menos un mensaje a tu bot primero
- Prueba la URL de getUpdates para ver si hay mensajes

### La página se ve rara
- Usa un navegador moderno (Chrome, Firefox, Edge)
- Asegúrate de tener conexión a internet (para cargar la fuente)

---

## Soporte

Si tienes problemas, revisa la consola del navegador (F12 > Console) para ver los errores específicos.
