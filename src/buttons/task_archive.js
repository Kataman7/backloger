const { EmbedBuilder } = require("discord.js");
const { COLORS, EMOJIS, STATUS, MESSAGES } = require("../utils/constants");
const ErrorHandler = require("../utils/errorHandler");
const ArchiveFinder = require("../utils/archiveFinder");

module.exports = {
    customId: "task_archive",

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

            // Vérifier si la tâche est validée
            const statusField = embed.fields.find(
                (field) => field.name === "Statut",
            );
            if (
                !statusField ||
                !statusField.value.includes(STATUS.VALIDATED)
            ) {
                await ErrorHandler.handleValidationError(
                    interaction,
                    MESSAGES.ERROR_TASK_NOT_VALIDATED,
                );
                return;
            }

            // Récupérer qui a terminé la tâche
            const completedByField = embed.fields.find(
                (field) => field.name === "Terminé par",
            );
            let completedBy = user.username;

            if (
                completedByField &&
                completedByField.value !== "Personne" &&
                completedByField.value !== user.username
            ) {
                completedBy = `${completedByField.value}, ${user.username}`;
            }

            // Mettre à jour l'embed pour l'archivage
            const updatedEmbed = EmbedBuilder.from(embed)
                .setColor(COLORS.DONE)
                .spliceFields(0, 1, {
                    name: "Statut",
                    value: `${EMOJIS.DONE} ${STATUS.DONE}`,
                    inline: true,
                })
                .spliceFields(2, 1, {
                    name: "Terminé par",
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
                    .setTitle(`📁 ${embed.title}`)
                    .setDescription(
                        `**Tâche archivée**\n\n${embed.description}\n\n---\n*Archivée le ${new Date().toLocaleDateString(
                            "fr-FR",
                            {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            },
                        )}*`,
                    )
                    .setFooter({
                        text: `Archivée par ${user.username}`,
                        iconURL: user.displayAvatarURL(),
                    })
                    .setTimestamp();

                // Envoyer dans le channel d'archive
                archiveMessage = await archiveChannel.send({
                    embeds: [archiveEmbed],
                    content: MESSAGES.ARCHIVE_CONTENT.replace('{user}', user).replace('{action}', 'archivé'),
                });

            } else {
                // Aucun channel archive disponible, tâche archivée sans archivage
            }

            // Supprimer le message original
            await message.delete();
        } catch (error) {
            await ErrorHandler.handleInteractionError(
                interaction,
                error,
                "Erreur lors de l'archivage de la tâche",
            );
            ErrorHandler.logError("Bouton task_archive", error, {
                userId: interaction.user.id,
                messageId: interaction.message.id,
                guildId: interaction.guildId,
                channelId: interaction.channelId,
            });
        }
    },
};