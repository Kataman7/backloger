/**
 * Constantes de configuration pour TrelloBot
 */

module.exports = {
    COLORS: {
        PENDING: 0x0099FF,    // Bleu - En attente
        IN_PROGRESS: 0xFFA500, // Orange - En cours
        DONE: 0x00FF00,       // Vert - Terminée
        ERROR: 0xFF0000       // Rouge - Erreur
    },

    EMOJIS: {
        PENDING: '🟡',
        IN_PROGRESS: '🟠',
        DONE: '🟢',
        ERROR: '🔴'
    },

    STATUS: {
        PENDING: 'En attente',
        IN_PROGRESS: 'En cours',
        DONE: 'Terminée'
    },

    LIMITS: {
        TASK_NAME_MAX: 100,
        TASK_DESC_MAX: 1000,
        ASSIGNED_USERS_MAX: 10
    },

    MESSAGES: {
        TASK_CREATED: '✅ Tâche créée avec succès!',
        TASK_IN_PROGRESS: '⚡ {user} est maintenant en train de faire cette tâche!',
        TASK_DONE: '✅ Tâche terminée et archivée par {user}!',
        ERROR_GENERIC: '❌ Une erreur est survenue.',
        ERROR_ARCHIVE_CHANNEL: '❌ Le channel d\'archive n\'est pas configuré ou n\'existe pas.',
        ERROR_ALREADY_ASSIGNED: '⚠️ Vous êtes déjà assigné à cette tâche!'
    }
};
