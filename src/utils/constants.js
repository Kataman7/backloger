/**
 * Constantes de configuration pour TrelloBot
 */

module.exports = {
    COLORS: {
        PENDING: 0xFFA500,    // Orange - En attente
        IN_PROGRESS: 0x0099FF, // Bleu - En cours
        VALIDATED: 0x00FF00,   // Vert - Validée
        DONE: 0xFFFFFF,       // Blanc - Terminée
        ERROR: 0xFF0000       // Rouge - Erreur
    },

    EMOJIS: {
        PENDING: '🟠',
        IN_PROGRESS: '🔵',
        VALIDATED: '🟢',
        DONE: '⚪',
        ERROR: '🔴'
    },

    STATUS: {
        PENDING: 'En attente',
        IN_PROGRESS: 'En cours',
        VALIDATED: 'Validée',
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
        TASK_VALIDATED: '✅ Tâche validée par {user}!',
        TASK_ARCHIVED: '📁 Tâche archivée par {user}!',
        TASK_STATUS_CHANGED: '✅ Statut de la tâche changé à "{status}" par {user}',
        ERROR_GENERIC: '❌ Une erreur est survenue.',
        ERROR_ARCHIVE_CHANNEL: '❌ Le channel d\'archive n\'est pas configuré ou n\'existe pas.',
        ERROR_ALREADY_ASSIGNED: '⚠️ Vous êtes déjà assigné à cette tâche!',
        ERROR_EMBED_NOT_FOUND: 'Impossible de trouver l\'embed de la tâche. La tâche a peut-être été supprimée.',
        ERROR_TASK_NOT_VALIDATED: 'Cette tâche doit être validée avant d\'être archivée.',
        ERROR_TASK_ALREADY_DONE: 'Cette tâche est déjà marquée comme terminée.',
        ERROR_TASK_ASSIGNMENT_LIMIT: 'Cette tâche a déjà atteint la limite de {limit} utilisateurs assignés.',
        ERROR_TASK_NAME_EMPTY: 'Le nom de la tâche ne peut pas être vide.',
        ERROR_TASK_DESC_EMPTY: 'La description de la tâche ne peut pas être vide.',
        ERROR_COMMAND_EXECUTION: '❌ Une erreur est survenue lors de l\'exécution de cette commande.',
        ERROR_BUTTON_EXECUTION: '❌ Une erreur est survenue lors du traitement de ce bouton.',
        ERROR_VALIDATION: '❌ Erreur de validation.',
        ERROR_INTERACTION: '❌ Erreur lors du traitement de l\'interaction.',
        ARCHIVE_CONTENT: '📁 **Tâche archivée**\n{user} a {action} cette tâche.',
        ERROR_ARCHIVE_TASK: 'Erreur lors de l\'archivage de la tâche',
        ERROR_DONE_TASK: 'Erreur lors de la finalisation de la tâche',
        ERROR_STATUS_CHANGE: 'Erreur lors du changement de statut de la tâche',
        ERROR_PARTICIPATION: 'Erreur lors de la gestion de la participation à la tâche',
        ERROR_TASK_CREATION: 'Erreur lors de la création de la tâche'
    },

    FIELD_NAMES: {
        STATUS: 'Statut',
        PARTICIPANTS: 'Participants',
        COMPLETED_BY: 'Terminé par'
    },

    DEFAULT_VALUES: {
        NO_ONE: 'Personne',
        UNKNOWN_USER: 'Utilisateur inconnu'
    },

    BUTTON_LABELS: {
        JOIN_LEAVE: 'Rejoindre/Quitter',
        START: 'Commencer',
        VALIDATE: 'Valider',
        ARCHIVE: 'Archiver'
    },

    EMBED_PREFIXES: {
        TASK: '📋',
        ARCHIVE: '📁'
    },

    COMMAND_NAMES: {
        TASK: 'task'
    },

    COMMAND_DESCRIPTIONS: {
        TASK: 'Crée une nouvelle tâche'
    },

    OPTION_NAMES: {
        NAME: 'nom',
        DESCRIPTION: 'description',
        ASSIGN: 'assigner'
    },

    OPTION_DESCRIPTIONS: {
        NAME: 'Nom de la tâche',
        DESCRIPTION: 'Description de la tâche',
        ASSIGN: 'Utilisateur à assigner à la tâche (optionnel)'
    },

    LOG_MESSAGES: {
        BUTTON_ARCHIVE: 'Bouton task_archive',
        BUTTON_DONE: 'Bouton task_done',
        BUTTON_STATUS: 'Bouton task_status',
        BUTTON_PARTICIPATION: 'Bouton task_toggle_participation',
        COMMAND_TASK: 'Commande /task'
    }
};
