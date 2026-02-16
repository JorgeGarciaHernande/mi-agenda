// Manejo de notificaciones por Telegram
const Telegram = {
    // Enviar mensaje a Telegram
    async sendMessage(message) {
        const token = Config.get('TELEGRAM_TOKEN');
        const chatId = Config.get('TELEGRAM_CHAT_ID');

        if (!token || !chatId) {
            console.warn('Telegram no configurado');
            return { success: false, error: 'Telegram no configurado' };
        }

        const url = `https://api.telegram.org/bot${token}/sendMessage`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'HTML'
                })
            });

            const data = await response.json();

            if (data.ok) {
                console.log('Mensaje de Telegram enviado correctamente');
                return { success: true };
            } else {
                console.error('Error de Telegram:', data.description);
                return { success: false, error: data.description };
            }
        } catch (error) {
            console.error('Error enviando mensaje de Telegram:', error);
            return { success: false, error: error.message };
        }
    },

    // Enviar notificación de tarea de alta prioridad
    async notifyHighPriorityTask(task) {
        const fecha = this.formatDate(task.date);
        const message = `
🚨 <b>TAREA DE ALTA PRIORIDAD</b> 🚨

📅 <b>Fecha:</b> ${fecha}
⏰ <b>Hora:</b> ${task.time}
📝 <b>Tarea:</b> ${task.description}

¡No olvides completar esta tarea!
        `.trim();

        return await this.sendMessage(message);
    },

    // Formatear fecha para el mensaje
    formatDate(dateStr) {
        const [year, month, day] = dateStr.split('-');
        const date = new Date(year, month - 1, day);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('es-MX', options);
    },

    // Probar conexión
    async testConnection() {
        const message = '✅ Conexión de prueba exitosa!\n\nTu bot de Telegram está configurado correctamente para recibir notificaciones de tu agenda.';
        return await this.sendMessage(message);
    }
};
