const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const {
    COLORS,
    EMOJIS,
    STATUS,
    MESSAGES,
} = require("../utils/constants");
const ErrorHandler = require("../utils/errorHandler");

module.exports = {
    customId: "task_status",

    async execute(interaction, client) {
        try {
            await interaction.deferUpdate();

            const user = interaction.user;
            const message = interaction.message;
            const embed = message.embeds[0];

            if (!embed) {
                await ErrorHandler.handleValidationError(
                    interaction,
                    MESSAGES.ERROR_EMBED_NOT_FOUND,
                );
                return;
            }

            // Récupérer le statut actuel
            const statusField = embed.fields.find(field => field.name === "Statut");
            let currentStatus = STATUS.PENDING;

            if (statusField) {
                if (statusField.value.includes(STATUS.PENDING)) {
                    currentStatus = STATUS.PENDING;
                } else if (statusField.value.includes(STATUS.IN_PROGRESS)) {
                    currentStatus = STATUS.IN_PROGRESS;
                } else if (statusField.value.includes(STATUS.VALIDATED)) {
                    currentStatus = STATUS.VALIDATED;
                }
            }

            // Déterminer le nouveau statut
            let newStatus, newColor, newEmoji, buttonLabel, buttonEmoji, buttonStyle;

            switch (currentStatus) {
                case STATUS.PENDING:
                    newStatus = STATUS.IN_PROGRESS;
                    newColor = COLORS.IN_PROGRESS;
                    newEmoji = EMOJIS.IN_PROGRESS;
                    buttonLabel = "Valider";
                    buttonEmoji = "✅";
                    buttonStyle = ButtonStyle.Success;
                    break;
                case STATUS.IN_PROGRESS:
                    newStatus = STATUS.VALIDATED;
                    newColor = COLORS.VALIDATED;
                    newEmoji = EMOJIS.VALIDATED;
                    buttonLabel = "Archiver";
                    buttonEmoji = "📁";
                    buttonStyle = ButtonStyle.Secondary;
                    break;
                case STATUS.VALIDATED:
                    // Si déjà validée, on ne fait rien (le bouton devient archiver)
                    newStatus = STATUS.VALIDATED;
                    newColor = COLORS.VALIDATED;
                    newEmoji = EMOJIS.VALIDATED;
                    buttonLabel = "Archiver";
                    buttonEmoji = "📁";
                    buttonStyle = ButtonStyle.Secondary;
                    break;
                default:
                    newStatus = STATUS.IN_PROGRESS;
                    newColor = COLORS.IN_PROGRESS;
                    newEmoji = EMOJIS.IN_PROGRESS;
                    buttonLabel = "Valider";
                    buttonEmoji = "✅";
                    buttonStyle = ButtonStyle.Success;
            }

            // Mettre à jour l'embed
            const updatedEmbed = EmbedBuilder.from(embed)
                .setColor(newColor)
                .spliceFields(0, 1, {
                    name: "Statut",
                    value: `${newEmoji} ${newStatus}`,
                    inline: true,
                });

            // Créer les boutons
            const buttons = new ActionRowBuilder();

            if (newStatus === STATUS.VALIDATED) {
                // Si validée, ajouter le bouton archiver
                buttons.addComponents(
                    new ButtonBuilder()
                        .setCustomId("task_archive")
                        .setLabel(buttonLabel)
                        .setStyle(buttonStyle)
                        .setEmoji(buttonEmoji)
                );
            } else {
                // Sinon, garder le bouton de statut
                buttons.addComponents(
                    new ButtonBuilder()
                        .setCustomId("task_status")
                        .setLabel(buttonLabel)
                        .setStyle(buttonStyle)
                        .setEmoji(buttonEmoji)
                );
            }

            // Mettre à jour le message
            await message.edit({
                embeds: [updatedEmbed],
                components: [buttons],
            });
        } catch (error) {
            await ErrorHandler.handleInteractionError(
                interaction,
                error,
                "Erreur lors du changement de statut de la tâche",
            );
            ErrorHandler.logError("Bouton task_status", error, {
                userId: interaction.user.id,
                messageId: interaction.message.id,
                guildId: interaction.guildId,
                channelId: interaction.channelId,
            });
        }
    },
};