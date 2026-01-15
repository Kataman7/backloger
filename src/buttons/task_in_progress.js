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

            // Récupérer les IDs des utilisateurs assignés depuis le footer
            let assignedUserIds = [];
            if (embed.footer && embed.footer.text) {
                const footerText = embed.footer.text;
                const idsMatch = footerText.match(/AssignedIDs:\s*(.+)/);
                if (idsMatch) {
                    assignedUserIds = idsMatch[1].split(',').filter(id => id.trim());
                }
            }

            // Récupérer les usernames correspondants
            let currentUsers = "Personne";
            if (assignedUserIds.length > 0) {
                try {
                    const usernames = [];
                    for (const userId of assignedUserIds) {
                        const member = await interaction.guild.members.fetch(userId);
                        usernames.push(member.user.username);
                    }
                    currentUsers = usernames.join(', ');
                } catch (error) {
                    console.error('Erreur lors de la récupération des usernames:', error);
                    // Fallback: utiliser les IDs si fetch échoue
                    currentUsers = assignedUserIds.join(', ');
                }
            }

            // Vérifier si l'utilisateur est déjà assigné
            const isAlreadyAssigned = assignedUserIds.includes(user.id);

            if (isAlreadyAssigned) {
                // Désassigner l'utilisateur
                assignedUserIds = assignedUserIds.filter(id => id !== user.id);
                console.log(`👤 ${user.username} s'est désassigné de la tâche`);
            } else {
                // Vérifier la limite d'utilisateurs
                if (assignedUserIds.length >= LIMITS.ASSIGNED_USERS_MAX) {
                    await ErrorHandler.handleValidationError(
                        interaction,
                        `Cette tâche a déjà atteint la limite de ${LIMITS.ASSIGNED_USERS_MAX} utilisateurs assignés.`,
                    );
                    return;
                }

                // Assigner l'utilisateur
                assignedUserIds.push(user.id);
                console.log(`👤 ${user.username} s'est assigné à la tâche`);
            }

            // Mettre à jour les usernames
            if (assignedUserIds.length > 0) {
                try {
                    const usernames = [];
                    for (const userId of assignedUserIds) {
                        const member = await interaction.guild.members.fetch(userId);
                        usernames.push(member.user.username);
                    }
                    currentUsers = usernames.join(', ');
                } catch (error) {
                    console.error('Erreur lors de la récupération des usernames pour mise à jour:', error);
                    currentUsers = assignedUserIds.join(', ');
                }
            } else {
                currentUsers = "Personne";
            }

            // Mettre à jour l'embed
            const updatedEmbed = EmbedBuilder.from(embed)
                .setColor(assignedUserIds.length > 0 ? COLORS.IN_PROGRESS : COLORS.PENDING)
                .spliceFields(1, 1, {
                    name: "Assigné à",
                    value: currentUsers,
                    inline: true,
                });

            // Mettre à jour le statut
            if (assignedUserIds.length > 0) {
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
            const footerText = assignedUserIds.length > 0 ? `AssignedIDs: ${assignedUserIds.join(',')}` : '';
            updatedEmbed.setFooter({
                text: footerText,
                iconURL: embed.footer?.iconURL || null,
            });

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
