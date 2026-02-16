// Manejo del calendario
const Calendar = {
    currentMonth: null,
    currentYear: null,

    // Inicializar calendario
    init() {
        const today = new Date();
        this.currentMonth = today.getMonth();
        this.currentYear = today.getFullYear();

        // Ajustar a fecha de inicio si estamos antes
        if (today < Config.START_DATE) {
            this.currentMonth = Config.START_DATE.getMonth();
            this.currentYear = Config.START_DATE.getFullYear();
        }

        this.render();
    },

    // Renderizar calendario
    render() {
        this.updateHeader();
        this.renderDays();
    },

    // Actualizar header del mes
    updateHeader() {
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        document.getElementById('currentMonth').textContent =
            `${monthNames[this.currentMonth]} ${this.currentYear}`;
    },

    // Renderizar días del mes
    renderDays() {
        const grid = document.getElementById('calendarGrid');
        grid.innerHTML = '';

        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const startDayOfWeek = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Días vacíos al inicio
        for (let i = 0; i < startDayOfWeek; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'calendar-day empty';
            grid.appendChild(emptyDiv);
        }

        // Días del mes
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.currentYear, this.currentMonth, day);
            const dateKey = this.formatDateKey(date);

            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar-day';
            dayDiv.innerHTML = `<span class="day-number">${day}</span>`;

            // Verificar si está dentro del rango
            if (date < Config.START_DATE || date > Config.END_DATE) {
                dayDiv.classList.add('other-month');
            }

            // Es hoy
            if (date.getTime() === today.getTime()) {
                dayDiv.classList.add('today');
            }

            // Tiene tareas del Sheet
            if (Sheets.hasTasks(dateKey)) {
                dayDiv.classList.add('has-tasks');
            }

            // Es día de subida
            if (Sheets.isUploadDay(dateKey)) {
                dayDiv.classList.add('upload-day');
            }

            // Tiene tareas personalizadas de alta prioridad (combina localStorage + Sheet)
            const localTasks = Config.getCustomTasksForDate(dateKey);
            const sheetCustomTasks = Sheets.getCustomTasksForDate(dateKey);
            const allCustomTasks = [...localTasks, ...sheetCustomTasks];
            if (allCustomTasks.some(t => t.priority === 'alta')) {
                dayDiv.classList.add('has-high-priority');
            } else if (allCustomTasks.length > 0) {
                dayDiv.classList.add('has-tasks');
            }

            // Evento click
            dayDiv.addEventListener('click', () => {
                if (!dayDiv.classList.contains('other-month')) {
                    this.showDayModal(date, dateKey);
                }
            });

            grid.appendChild(dayDiv);
        }
    },

    // Formatear fecha como YYYY-MM-DD
    formatDateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // Formatear fecha para mostrar
    formatDisplayDate(date) {
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('es-MX', options);
    },

    // Mes anterior
    prevMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.render();
    },

    // Mes siguiente
    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.render();
    },

    // Mostrar modal del día
    showDayModal(date, dateKey) {
        const modal = document.getElementById('dayModal');
        const modalDate = document.getElementById('modalDate');
        const modalCycle = document.getElementById('modalCycle');
        const tasksList = document.getElementById('tasksList');
        const customTasksList = document.getElementById('customTasksList');

        // Fecha formateada
        modalDate.textContent = this.formatDisplayDate(date);

        // Ciclo del día
        const cycle = Sheets.getCycle(dateKey);
        modalCycle.textContent = cycle || 'Sin ciclo asignado';
        modalCycle.style.display = cycle ? 'block' : 'none';

        // Tareas del Sheet
        const sheetTasks = Sheets.getTasksForDay(dateKey);
        if (sheetTasks.length > 0) {
            tasksList.innerHTML = sheetTasks.map(task => `
                <div class="task-item">
                    <span class="task-time">${task.time}</span>
                    <span class="task-description">${task.description}</span>
                </div>
            `).join('');
        } else {
            tasksList.innerHTML = '<div class="task-item empty">No hay tareas programadas en el Sheet</div>';
        }

        // Tareas personalizadas (combina localStorage + Sheet)
        const localTasks = Config.getCustomTasksForDate(dateKey);
        const sheetCustomTasks = Sheets.getCustomTasksForDate(dateKey);
        const allCustomTasks = [...sheetCustomTasks, ...localTasks];

        if (allCustomTasks.length > 0) {
            customTasksList.innerHTML = allCustomTasks.map(task => `
                <div class="task-item">
                    <span class="task-time">${task.time}</span>
                    <span class="task-description">${task.description}</span>
                    <span class="task-priority ${task.priority}">${task.priority}</span>
                </div>
            `).join('');
        } else {
            customTasksList.innerHTML = '<div class="task-item empty">No hay tareas personalizadas</div>';
        }

        modal.classList.add('active');
    },

    // Cerrar modal del día
    closeDayModal() {
        document.getElementById('dayModal').classList.remove('active');
    }
};
