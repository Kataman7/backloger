const { EmbedBuilder } = require("discord.js");
const { COLORS, EMOJIS, STATUS, MESSAGES, FIELD_NAMES, DEFAULT_VALUES, EMBED_PREFIXES, LOG_MESSAGES } = require("../utils/constants");
const ErrorHandler = require("../utils/errorHandler");
const ArchiveFinder = require("../utils/archiveFinder");

module.exports = {
    customId: "task_done",

    async execute(interaction, client) {
        try {
            await interaction.deferUpdate();

            const user = interaction.user;
            const message = interaction.message;
            const embed = message.embeds[0];
            const channel = interaction.channel;

            if (!embed) {
                await ErrorHandler.handleValidationError(
                    interaction,
                    MESSAGES.ERROR_EMBED_NOT_FOUND,
                );
                return;
            }

            // Vérifier si la tâche est déjà terminée
            const statusField = embed.fields.find(
                (field) => field.name === FIELD_NAMES.STATUS,
            );
            if (
                statusField &&
                statusField.value === `${EMOJIS.DONE} ${STATUS.DONE}`
            ) {
                await ErrorHandler.handleValidationError(
                    interaction,
                    MESSAGES.ERROR_TASK_ALREADY_DONE,
                );
                return;
            }

            // Récupérer qui a terminé la tâche
            const completedByField = embed.fields.find(
                (field) => field.name === FIELD_NAMES.COMPLETED_BY,
            );
            let completedBy = user.username;

            if (
                completedByField &&
                completedByField.value !== DEFAULT_VALUES.NO_ONE &&
                completedByField.value !== user.username
            ) {
                completedBy = `${completedByField.value}, ${user.username}`;
            }

            // Mettre à jour l'embed pour le marquer comme terminé
            const updatedEmbed = EmbedBuilder.from(embed)
                .setColor(COLORS.DONE)
                .spliceFields(0, 1, {
                    name: FIELD_NAMES.STATUS,
                    value: `${EMOJIS.DONE} ${STATUS.DONE}`,
                    inline: true,
                })
                .spliceFields(2, 1, {
                    name: FIELD_NAMES.COMPLETED_BY,
                    value: completedBy,
                    inline: true,
                });

            // Trouver le channel archive
            const archiveChannel =
                await ArchiveFinder.findOrCreateArchiveChannel(channel);

            let archiveMessage = null;

            // Si un channel archive existe et que le bot a accès, archiver la tâche
            if (archiveChannel && ArchiveFinder.hasArchiveAccess(archiveChannel)) {
                // Créer l'embed pour l'archive
                const archiveEmbed = EmbedBuilder.from(updatedEmbed)
                    .setTitle(`${EMBED_PREFIXES.ARCHIVE} ${embed.title}`)
                    .setDescription(
                        MESSAGES.ARCHIVE_DESCRIPTION.replace('{description}', embed.description).replace('{date}', new Date().toLocaleDateString(
                            "fr-FR",
                            {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            },
                        )),
                    )
                    .setFooter({
                        text: `Archivée par ${user.username}`,
                        iconURL: user.displayAvatarURL(),
                    })
                    .setTimestamp();

                // Envoyer dans le channel d'archive
                archiveMessage = await archiveChannel.send({
                    embeds: [archiveEmbed],
                    content: MESSAGES.ARCHIVE_CONTENT.replace('{user}', user).replace('{action}', 'terminé'),
                });

            } else {
                // Aucun channel archive disponible, tâche terminée sans archivage
            }

            // Supprimer le message original
            await message.delete();
        } catch (error) {
            await ErrorHandler.handleInteractionError(
                interaction,
                error,
                MESSAGES.ERROR_DONE_TASK,
            );
            ErrorHandler.logError(LOG_MESSAGES.BUTTON_DONE, error, {
                userId: interaction.user.id,
                messageId: interaction.message.id,
                guildId: interaction.guildId,
                channelId: interaction.channelId,
            });
        }
    },
};
