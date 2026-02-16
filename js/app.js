// Aplicación principal
const App = {
    // Inicializar aplicación
    async init() {
        console.log('Iniciando Mi Agenda...');

        // Cargar datos del Google Sheet
        const loaded = await Sheets.load();
        if (loaded) {
            console.log('Datos del Sheet cargados correctamente');
        } else {
            this.showToast('Error cargando datos del calendario', 'error');
        }

        // Inicializar calendario
        Calendar.init();

        // Configurar eventos
        this.setupEventListeners();

        // Cargar configuración guardada
        this.loadSavedConfig();

        console.log('Mi Agenda lista!');
    },

    // Configurar event listeners
    setupEventListeners() {
        // Navegación del calendario
        document.getElementById('prevMonth').addEventListener('click', () => Calendar.prevMonth());
        document.getElementById('nextMonth').addEventListener('click', () => Calendar.nextMonth());

        // Modal del día
        document.getElementById('closeDayModal').addEventListener('click', () => Calendar.closeDayModal());
        document.getElementById('dayModal').addEventListener('click', (e) => {
            if (e.target.id === 'dayModal') Calendar.closeDayModal();
        });

        // Modal agregar tarea
        document.getElementById('btnAddTask').addEventListener('click', () => this.showAddTaskModal());
        document.getElementById('closeAddModal').addEventListener('click', () => this.closeAddTaskModal());
        document.getElementById('addTaskModal').addEventListener('click', (e) => {
            if (e.target.id === 'addTaskModal') this.closeAddTaskModal();
        });

        // Formulario de tarea
        document.getElementById('taskForm').addEventListener('submit', (e) => this.handleTaskSubmit(e));

        // Modal configuración
        document.getElementById('btnConfig').addEventListener('click', () => this.showConfigModal());
        document.getElementById('closeConfigModal').addEventListener('click', () => this.closeConfigModal());
        document.getElementById('configModal').addEventListener('click', (e) => {
            if (e.target.id === 'configModal') this.closeConfigModal();
        });

        // Formulario de configuración
        document.getElementById('configForm').addEventListener('submit', (e) => this.handleConfigSubmit(e));

        // Tecla Escape para cerrar modales
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                Calendar.closeDayModal();
                this.closeAddTaskModal();
                this.closeConfigModal();
            }
        });
    },

    // Mostrar modal agregar tarea
    showAddTaskModal() {
        const modal = document.getElementById('addTaskModal');
        const dateInput = document.getElementById('taskDate');

        // Establecer fecha mínima y máxima
        dateInput.min = this.formatInputDate(Config.START_DATE);
        dateInput.max = this.formatInputDate(Config.END_DATE);

        // Establecer fecha actual por defecto
        const today = new Date();
        if (today >= Config.START_DATE && today <= Config.END_DATE) {
            dateInput.value = this.formatInputDate(today);
        } else {
            dateInput.value = this.formatInputDate(Config.START_DATE);
        }

        modal.classList.add('active');
    },

    // Cerrar modal agregar tarea
    closeAddTaskModal() {
        document.getElementById('addTaskModal').classList.remove('active');
        document.getElementById('taskForm').reset();
    },

    // Mostrar modal configuración
    showConfigModal() {
        document.getElementById('telegramToken').value = Config.get('TELEGRAM_TOKEN');
        document.getElementById('telegramChatId').value = Config.get('TELEGRAM_CHAT_ID');
        document.getElementById('appsScriptUrl').value = Config.get('APPS_SCRIPT_URL');
        document.getElementById('configModal').classList.add('active');
    },

    // Cerrar modal configuración
    closeConfigModal() {
        document.getElementById('configModal').classList.remove('active');
    },

    // Cargar configuración guardada
    loadSavedConfig() {
        // La configuración se carga automáticamente del localStorage vía Config
        if (Config.isConfigured()) {
            console.log('Configuración de Telegram cargada');
        }
    },

    // Manejar envío del formulario de tarea
    async handleTaskSubmit(e) {
        e.preventDefault();

        const submitBtn = e.target.querySelector('.btn-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Guardando...';

        const task = {
            date: document.getElementById('taskDate').value,
            time: document.getElementById('taskTime').value,
            description: document.getElementById('taskDescription').value,
            priority: document.getElementById('taskPriority').value
        };

        // Formatear hora para mostrar
        task.time = this.formatTime(task.time);

        try {
            // Guardar localmente
            Config.saveCustomTask(task);

            // Guardar en Google Sheet (el Apps Script enviará el recordatorio)
            await Sheets.addTask(task);

            // Mostrar confirmación
            this.showToast('Tarea guardada. Te recordaré 30 min antes.', 'success');

            // Actualizar calendario
            Calendar.render();

            // Cerrar modal
            this.closeAddTaskModal();

        } catch (error) {
            console.error('Error guardando tarea:', error);
            this.showToast('Error guardando la tarea', 'error');
        }

        submitBtn.disabled = false;
        submitBtn.textContent = 'Guardar Tarea';
    },

    // Manejar envío del formulario de configuración
    async handleConfigSubmit(e) {
        e.preventDefault();

        const token = document.getElementById('telegramToken').value.trim();
        const chatId = document.getElementById('telegramChatId').value.trim();
        const appsScriptUrl = document.getElementById('appsScriptUrl').value.trim();

        Config.set('TELEGRAM_TOKEN', token);
        Config.set('TELEGRAM_CHAT_ID', chatId);
        Config.set('APPS_SCRIPT_URL', appsScriptUrl);

        // Probar conexión de Telegram si está configurado
        if (token && chatId) {
            this.showToast('Probando conexión de Telegram...', 'success');
            const result = await Telegram.testConnection();
            if (result.success) {
                this.showToast('Configuración guardada. Telegram funcionando!', 'success');
            } else {
                this.showToast('Configuración guardada pero Telegram falló: ' + result.error, 'error');
            }
        } else {
            this.showToast('Configuración guardada', 'success');
        }

        this.closeConfigModal();
    },

    // Formatear fecha para input date
    formatInputDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // Formatear hora de 24h a 12h
    formatTime(time24) {
        const [hours, minutes] = time24.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    },

    // Mostrar toast notification
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
};

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => App.init());
