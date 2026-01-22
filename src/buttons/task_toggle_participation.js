const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const {
    COLORS,
    EMOJIS,
    STATUS,
    MESSAGES,
    LIMITS,
    FIELD_NAMES,
    DEFAULT_VALUES,
    LOG_MESSAGES
} = require("../utils/constants");
const ErrorHandler = require("../utils/errorHandler");

module.exports = {
    customId: "task_toggle_participation",

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

            // Récupérer les participants du champ Participants
            const participantsField = embed.fields.find(field => field.name === FIELD_NAMES.PARTICIPANTS);
            let participants = [];
            if (participantsField && participantsField.value !== DEFAULT_VALUES.NO_ONE) {
                participants = participantsField.value.split(', ').map(mention => {
                    const match = mention.match(/<@(\d+)>/);
                    return match ? match[1] : null;
                }).filter(id => id);
            }

            // Vérifier si l'utilisateur est déjà participant
            const isParticipant = participants.includes(user.id);

            if (isParticipant) {
                // Quitter la tâche
                participants = participants.filter(id => id !== user.id);
            } else {
                // Vérifier la limite
                if (participants.length >= LIMITS.ASSIGNED_USERS_MAX) {
                    await ErrorHandler.handleValidationError(
                        interaction,
                        MESSAGES.ERROR_TASK_ASSIGNMENT_LIMIT.replace('{limit}', LIMITS.ASSIGNED_USERS_MAX),
                    );
                    return;
                }

                // Rejoindre la tâche
                participants.push(user.id);
            }

            // Mettre à jour la liste des mentions
            const participantMentions = await Promise.all(
                participants.map(async (id) => {
                    try {
                        const member = await interaction.guild.members.fetch(id);
                        return `<@${id}>`;
                    } catch {
                        return DEFAULT_VALUES.UNKNOWN_USER;
                    }
                })
            );

            // Mettre à jour l'embed
            const updatedEmbed = EmbedBuilder.from(embed)
                .spliceFields(1, 1, {
                    name: FIELD_NAMES.PARTICIPANTS,
                    value: participantMentions.join(', ') || DEFAULT_VALUES.NO_ONE,
                    inline: true,
                });

            // Mettre à jour le message
            await message.edit({
                embeds: [updatedEmbed],
            });

        } catch (error) {
            await ErrorHandler.handleInteractionError(
                interaction,
                error,
                MESSAGES.ERROR_PARTICIPATION,
            );
            ErrorHandler.logError(LOG_MESSAGES.BUTTON_PARTICIPATION, error, {
                userId: interaction.user.id,
                messageId: interaction.message.id,
                guildId: interaction.guildId,
                channelId: interaction.channelId,
            });
        }
    },
};