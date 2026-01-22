const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const {
    COLORS,
    EMOJIS,
    STATUS,
    MESSAGES,
    FIELD_NAMES,
    BUTTON_LABELS,
    LOG_MESSAGES
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
            const statusField = embed.fields.find(field => field.name === FIELD_NAMES.STATUS);
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
                    buttonLabel = BUTTON_LABELS.VALIDATE;
                    buttonEmoji = "✅";
                    buttonStyle = ButtonStyle.Success;
                    break;
                case STATUS.IN_PROGRESS:
                    newStatus = STATUS.VALIDATED;
                    newColor = COLORS.VALIDATED;
                    newEmoji = EMOJIS.VALIDATED;
                    buttonLabel = BUTTON_LABELS.ARCHIVE;
                    buttonEmoji = "📁";
                    buttonStyle = ButtonStyle.Secondary;
                    break;
                case STATUS.VALIDATED:
                    // Si déjà validée, on ne fait rien (le bouton devient archiver)
                    newStatus = STATUS.VALIDATED;
                    newColor = COLORS.VALIDATED;
                    newEmoji = EMOJIS.VALIDATED;
                    buttonLabel = BUTTON_LABELS.ARCHIVE;
                    buttonEmoji = "📁";
                    buttonStyle = ButtonStyle.Secondary;
                    break;
                default:
                    newStatus = STATUS.IN_PROGRESS;
                    newColor = COLORS.IN_PROGRESS;
                    newEmoji = EMOJIS.IN_PROGRESS;
                    buttonLabel = BUTTON_LABELS.VALIDATE;
                    buttonEmoji = "✅";
                    buttonStyle = ButtonStyle.Success;
            }

            // Mettre à jour l'embed
            const updatedEmbed = EmbedBuilder.from(embed)
                .setColor(newColor)
                .spliceFields(0, 1, {
                    name: FIELD_NAMES.STATUS,
                    value: `${newEmoji} ${newStatus}`,
                    inline: true,
                });

            // Si on passe à VALIDATED, mettre à jour "Terminé par"
            if (newStatus === STATUS.VALIDATED) {
                updatedEmbed.spliceFields(2, 1, {
                    name: "Terminé par",
                    value: `<@${user.id}>`,
                    inline: true,
                });
            }

            // Créer les boutons
            const buttons = new ActionRowBuilder();

            // Toujours ajouter le bouton de participation
            buttons.addComponents(
                new ButtonBuilder()
                    .setCustomId("task_toggle_participation")
                    .setLabel(BUTTON_LABELS.JOIN_LEAVE)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji("👥")
            );

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
                MESSAGES.ERROR_STATUS_CHANGE,
            );
            ErrorHandler.logError(LOG_MESSAGES.BUTTON_STATUS, error, {
                userId: interaction.user.id,
                messageId: interaction.message.id,
                guildId: interaction.guildId,
                channelId: interaction.channelId,
            });
        }
    },
};