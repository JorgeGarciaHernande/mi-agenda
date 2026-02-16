// Manejo de Google Sheets
const Sheets = {
    data: [],
    dataByDate: {},
    customTasks: [], // Tareas personalizadas del Sheet

    // Cargar datos del Google Sheet
    async load() {
        try {
            // Cargar calendario CSV
            const response = await fetch(Config.SHEET_CSV_URL);
            const csvText = await response.text();
            this.parseCSV(csvText);

            // Cargar tareas personalizadas del Apps Script
            await this.loadCustomTasks();

            return true;
        } catch (error) {
            console.error('Error cargando Google Sheet:', error);
            return false;
        }
    },

    // Cargar tareas personalizadas desde el Apps Script
    async loadCustomTasks() {
        const appsScriptUrl = Config.APPS_SCRIPT_URL || Config.get('APPS_SCRIPT_URL');

        if (!appsScriptUrl) {
            console.log('No hay URL de Apps Script configurada');
            return;
        }

        try {
            const response = await fetch(appsScriptUrl);
            const data = await response.json();

            if (data.success && data.tasks) {
                this.customTasks = data.tasks;
                console.log(`Cargadas ${this.customTasks.length} tareas personalizadas del Sheet`);
            }
        } catch (error) {
            console.error('Error cargando tareas personalizadas:', error);
        }
    },

    // Obtener tareas personalizadas de una fecha
    getCustomTasksForDate(dateKey) {
        return this.customTasks.filter(t => t.date === dateKey);
    },

    // Parsear CSV a objetos
    parseCSV(csv) {
        const lines = csv.split('\n');
        const headers = this.parseCSVLine(lines[0]);

        this.data = [];
        this.dataByDate = {};

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;

            const values = this.parseCSVLine(lines[i]);
            const row = {};

            headers.forEach((header, index) => {
                row[header.trim()] = values[index] ? values[index].trim() : '';
            });

            // Convertir fecha DD/MM/YYYY a YYYY-MM-DD
            if (row['Fecha']) {
                const [day, month, year] = row['Fecha'].split('/');
                row['dateKey'] = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }

            this.data.push(row);

            if (row['dateKey']) {
                this.dataByDate[row['dateKey']] = row;
            }
        }

        console.log(`Cargadas ${this.data.length} filas del calendario`);
    },

    // Parsear una línea CSV (maneja comas dentro de comillas)
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let char of line) {
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        return result;
    },

    // Obtener datos de un día específico
    getDay(dateKey) {
        return this.dataByDate[dateKey] || null;
    },

    // Obtener tareas de un día (columnas de horas)
    getTasksForDay(dateKey) {
        const dayData = this.getDay(dateKey);
        if (!dayData) return [];

        const tasks = [];
        const timeColumns = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM'];

        timeColumns.forEach(time => {
            if (dayData[time] && dayData[time].trim()) {
                tasks.push({
                    time: time,
                    description: dayData[time],
                    source: 'sheet'
                });
            }
        });

        return tasks;
    },

    // Verificar si un día tiene tareas
    hasTasks(dateKey) {
        const tasks = this.getTasksForDay(dateKey);
        return tasks.length > 0;
    },

    // Verificar si es día de subida
    isUploadDay(dateKey) {
        const dayData = this.getDay(dateKey);
        if (!dayData) return false;
        return dayData['Ciclo'] && dayData['Ciclo'].includes('SUBIR VIDEO');
    },

    // Obtener el ciclo del día
    getCycle(dateKey) {
        const dayData = this.getDay(dateKey);
        return dayData ? dayData['Ciclo'] || '' : '';
    },

    // Agregar tarea al Google Sheet via Apps Script
    async addTask(task) {
        const appsScriptUrl = Config.APPS_SCRIPT_URL || Config.get('APPS_SCRIPT_URL');

        if (!appsScriptUrl) {
            console.log('No hay URL de Apps Script configurada, guardando solo localmente');
            return { success: true, local: true };
        }

        try {
            const response = await fetch(appsScriptUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(task)
            });

            return { success: true };
        } catch (error) {
            console.error('Error guardando en Google Sheet:', error);
            return { success: false, error: error.message };
        }
    }
};
