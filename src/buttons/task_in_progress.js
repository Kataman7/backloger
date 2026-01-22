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
                    MESSAGES.ERROR_EMBED_NOT_FOUND,
                );
                return;
            }

            // Récupérer les participants du footer
            const footerText = embed.footer?.text?.trim() || '';
            let participants = footerText ? footerText.split(',').filter(id => id.trim()) : [];

            // Récupérer les usernames correspondants
            let currentUsers = "Personne";
            if (participants.length > 0) {
                try {
                    const usernames = [];
                    for (const userId of participants) {
                        const member = await interaction.guild.members.fetch(userId);
                        usernames.push(member.user.username);
                    }
                    currentUsers = usernames.join(', ');
                } catch (error) {
                    console.error('Erreur lors de la récupération des usernames:', error);
                    // Fallback: utiliser les IDs si fetch échoue
                    currentUsers = participants.join(', ');
                }
            }

            // Vérifier si l'utilisateur est déjà participant
            const isAlreadyAssigned = participants.includes(user.id);

            if (isAlreadyAssigned) {
                // Désassigner l'utilisateur
                participants = participants.filter(id => id !== user.id);
            } else {
                // Vérifier la limite d'utilisateurs
                if (participants.length >= LIMITS.ASSIGNED_USERS_MAX) {
                    await ErrorHandler.handleValidationError(
                        interaction,
                        MESSAGES.ERROR_TASK_ASSIGNMENT_LIMIT.replace('{limit}', LIMITS.ASSIGNED_USERS_MAX),
                    );
                    return;
                }

                // Assigner l'utilisateur
                participants.push(user.id);
            }

            // Mettre à jour les usernames
            if (participants.length > 0) {
                try {
                    const usernames = [];
                    for (const userId of participants) {
                        const member = await interaction.guild.members.fetch(userId);
                        usernames.push(member.user.username);
                    }
                    currentUsers = usernames.join(', ');
                } catch (error) {
                    console.error('Erreur lors de la récupération des usernames pour mise à jour:', error);
                    currentUsers = participants.join(', ');
                }
            } else {
                currentUsers = "Personne";
            }

            // Mettre à jour l'embed
            const updatedEmbed = EmbedBuilder.from(embed)
                .setColor(participants.length > 0 ? COLORS.IN_PROGRESS : COLORS.PENDING)
                .spliceFields(1, 1, {
                    name: "Participants",
                    value: currentUsers,
                    inline: true,
                });

            // Mettre à jour le statut
            if (participants.length > 0) {
                // Si des utilisateurs assignés, mettre en cours
                updatedEmbed.spliceFields(0, 1, {
                    name: "Statut",
                    value: `${EMOJIS.IN_PROGRESS} ${STATUS.IN_PROGRESS}`,
                    inline: true,
                });
            } else {
                // Si plus personne assigné, remettre à PENDING
                updatedEmbed.spliceFields(0, 1, {
                    name: "Statut",
                    value: `${EMOJIS.PENDING} ${STATUS.PENDING}`,
                    inline: true,
                });
            }

            // Mettre à jour le footer avec les IDs
            updatedEmbed.setFooter({
                text: participants.join(',') || ' ',
            });

            // Mettre à jour le message
            await message.edit({
                embeds: [updatedEmbed],
            });
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
