const { EmbedBuilder } = require("discord.js");
const { COLORS, EMOJIS, STATUS, MESSAGES } = require("../utils/constants");
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
                    "Impossible de trouver l'embed de la tâche. La tâche a peut-être été supprimée.",
                );
                return;
            }

            // Vérifier si la tâche est déjà terminée
            const statusField = embed.fields.find(
                (field) => field.name === "Statut",
            );
            if (
                statusField &&
                statusField.value === `${EMOJIS.DONE} ${STATUS.DONE}`
            ) {
                await ErrorHandler.handleValidationError(
                    interaction,
                    "Cette tâche est déjà marquée comme terminée.",
                );
                return;
            }

            // Trouver le channel archive
            const archiveChannel =
                await ArchiveFinder.findOrCreateArchiveChannel(channel);

            if (!archiveChannel) {
                await ErrorHandler.handleMissingArchiveError(interaction);
                return;
            }

            // Vérifier les permissions du bot dans le channel archive
            if (!ArchiveFinder.hasArchiveAccess(archiveChannel)) {
                await ErrorHandler.handleValidationError(
                    interaction,
                    "Le bot n'a pas les permissions nécessaires dans le channel archive.\n" +
                        "Permissions requises: Voir le salon, Envoyer des messages, Intégrer des liens",
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

            // Mettre à jour l'embed original pour le marquer comme terminé
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
            const archiveMessage = await archiveChannel.send({
                embeds: [archiveEmbed],
                content: `📁 **Tâche archivée**\n${user} a terminé cette tâche.`,
            });

            // Mettre à jour le message original
            await message.edit({
                embeds: [updatedEmbed],
                components: [], // Supprimer les boutons
            });

            console.log(`✅ Tâche terminée par ${user.tag}`);
            console.log(
                `📁 Archivée dans: #${archiveChannel.name} (${archiveMessage.id})`,
            );
            console.log(`👤 Terminée par: ${completedBy}`);
        } catch (error) {
            await ErrorHandler.handleInteractionError(
                interaction,
                error,
                "Erreur lors de la finalisation de la tâche",
            );
            ErrorHandler.logError("Bouton task_done", error, {
                userId: interaction.user.id,
                messageId: interaction.message.id,
                guildId: interaction.guildId,
                channelId: interaction.channelId,
            });
        }
    },
};
