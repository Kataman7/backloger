const { EmbedBuilder } = require("discord.js");
const {
    COLORS,
    EMOJIS,
    STATUS,
    MESSAGES,
    LIMITS,
} = require("../utils/constants");
const ErrorHandler = require("../utils/errorHandler");

module.exports = {
    customId: "task_in_progress",

    async execute(interaction, client) {
        try {
            await interaction.deferUpdate();

            const user = interaction.user;
            const message = interaction.message;
            const embed = message.embeds[0];

            if (!embed) {
                await ErrorHandler.handleValidationError(
                    interaction,
                    "Impossible de trouver l'embed de la tâche. La tâche a peut-être été supprimée.",
                );
                return;
            }

            // Récupérer les utilisateurs déjà en cours
            const inProgressField = embed.fields.find(
                (field) => field.name === "Assigné à",
            );
            let currentUsers = "Personne";

            if (inProgressField && inProgressField.value !== "Personne") {
                currentUsers = inProgressField.value;

                // Vérifier si l'utilisateur est déjà dans la liste
                if (currentUsers.includes(user.username)) {
                    await ErrorHandler.handleValidationError(
                        interaction,
                        MESSAGES.ERROR_ALREADY_ASSIGNED,
                    );
                    return;
                }

                // Compter le nombre d'utilisateurs
                const userCount = currentUsers.split(",").length;
                if (userCount >= LIMITS.ASSIGNED_USERS_MAX) {
                    await ErrorHandler.handleValidationError(
                        interaction,
                        `Cette tâche a déjà atteint la limite de ${LIMITS.ASSIGNED_USERS_MAX} utilisateurs assignés.`,
                    );
                    return;
                }

                // Ajouter l'utilisateur à la liste
                currentUsers += `, ${user.username}`;
            } else {
                currentUsers = user.username;
            }

            // Mettre à jour l'embed
            const updatedEmbed = EmbedBuilder.from(embed)
                .setColor(COLORS.IN_PROGRESS)
                .spliceFields(1, 1, {
                    name: "Assigné à",
                    value: currentUsers,
                    inline: true,
                });

            // Mettre à jour le statut
            const statusField = embed.fields.find(
                (field) => field.name === "Statut",
            );
            if (
                statusField &&
                statusField.value !==
                    `${EMOJIS.IN_PROGRESS} ${STATUS.IN_PROGRESS}`
            ) {
                updatedEmbed.spliceFields(0, 1, {
                    name: "Statut",
                    value: `${EMOJIS.IN_PROGRESS} ${STATUS.IN_PROGRESS}`,
                    inline: true,
                });
            }

            // Mettre à jour le message
            await message.edit({
                embeds: [updatedEmbed],
            });

            console.log(`✅ Tâche mise en cours par ${user.tag}`);
            console.log(`👥 Utilisateurs assignés: ${currentUsers}`);
        } catch (error) {
            await ErrorHandler.handleInteractionError(
                interaction,
                error,
                "Erreur lors de la mise en cours de la tâche",
            );
            ErrorHandler.logError("Bouton task_in_progress", error, {
                userId: interaction.user.id,
                messageId: interaction.message.id,
                guildId: interaction.guildId,
                channelId: interaction.channelId,
            });
        }
    },
};
