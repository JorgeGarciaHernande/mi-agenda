// Configuración de la aplicación
const Config = {
    // URL del Google Sheet publicado (CSV)
    SHEET_CSV_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR-YlOPRyCccEw9SXmoz3s6j-SF3SajvnQC8bnqyGaMSbUkVmRY6DYJfDLZwDo5lqznPJ55IwB7dNrD/pub?gid=0&single=true&output=csv',

    // Rango de fechas del calendario
    START_DATE: new Date(2026, 1, 15), // 15 febrero 2026
    END_DATE: new Date(2027, 1, 14),   // 14 febrero 2027

    // Claves de localStorage
    STORAGE_KEYS: {
        TELEGRAM_TOKEN: 'agenda_telegram_token',
        TELEGRAM_CHAT_ID: 'agenda_telegram_chat_id',
        APPS_SCRIPT_URL: 'agenda_apps_script_url',
        CUSTOM_TASKS: 'agenda_custom_tasks'
    },

    // Obtener configuración guardada
    get(key) {
        return localStorage.getItem(this.STORAGE_KEYS[key]) || '';
    },

    // Guardar configuración
    set(key, value) {
        localStorage.setItem(this.STORAGE_KEYS[key], value);
    },

    // Obtener tareas personalizadas
    getCustomTasks() {
        const tasks = localStorage.getItem(this.STORAGE_KEYS.CUSTOM_TASKS);
        return tasks ? JSON.parse(tasks) : [];
    },

    // Guardar tarea personalizada
    saveCustomTask(task) {
        const tasks = this.getCustomTasks();
        task.id = Date.now();
        tasks.push(task);
        localStorage.setItem(this.STORAGE_KEYS.CUSTOM_TASKS, JSON.stringify(tasks));
        return task;
    },

    // Obtener tareas de un día específico
    getCustomTasksForDate(dateStr) {
        const tasks = this.getCustomTasks();
        return tasks.filter(t => t.date === dateStr);
    },

    // Verificar si la configuración está completa
    isConfigured() {
        return this.get('TELEGRAM_TOKEN') && this.get('TELEGRAM_CHAT_ID');
    }
};
