const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");
const {
    COLORS,
    EMOJIS,
    STATUS,
    LIMITS,
    MESSAGES,
    FIELD_NAMES,
    DEFAULT_VALUES,
    BUTTON_LABELS,
    EMBED_PREFIXES,
    COMMAND_DESCRIPTIONS,
    OPTION_NAMES,
    OPTION_DESCRIPTIONS,
    LOG_MESSAGES
} = require("../utils/constants");
const ErrorHandler = require("../utils/errorHandler");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("task")
        .setDescription(COMMAND_DESCRIPTIONS.TASK)
        .addStringOption((option) =>
            option
                .setName(OPTION_NAMES.NAME)
                .setDescription(OPTION_DESCRIPTIONS.NAME)
                .setRequired(true)
                .setMaxLength(LIMITS.TASK_NAME_MAX),
        )
        .addStringOption((option) =>
            option
                .setName(OPTION_NAMES.DESCRIPTION)
                .setDescription(OPTION_DESCRIPTIONS.DESCRIPTION)
                .setRequired(true)
                .setMaxLength(LIMITS.TASK_DESC_MAX),
        )
        .addUserOption((option) =>
            option
                .setName(OPTION_NAMES.ASSIGN)
                .setDescription(OPTION_DESCRIPTIONS.ASSIGN)
                .setRequired(false)
        ),

    async execute(interaction, client) {
        try {
            await interaction.deferReply({ ephemeral: false });

            const taskName = interaction.options.getString(OPTION_NAMES.NAME);
            const taskDescription =
                interaction.options.getString(OPTION_NAMES.DESCRIPTION);
            const assignedUser = interaction.options.getUser(OPTION_NAMES.ASSIGN);
            const user = interaction.user;
            const channel = interaction.channel;

            // Validation des entrées
            if (!taskName || taskName.trim().length === 0) {
                await ErrorHandler.handleValidationError(
                    interaction,
                    MESSAGES.ERROR_TASK_NAME_EMPTY,
                );
                return;
            }

            if (!taskDescription || taskDescription.trim().length === 0) {
                await ErrorHandler.handleValidationError(
                    interaction,
                    MESSAGES.ERROR_TASK_DESC_EMPTY,
                );
                return;
            }

            // Vérifier le channel d'archive
            const archiveCheck =
                await ErrorHandler.checkArchiveChannel(channel);
            if (!archiveCheck.success) {
                await ErrorHandler.handleMissingArchiveError(
                    interaction,
                    archiveCheck.error,
                );
                return;
            }

            // Créer l'embed de la tâche
            const participants = assignedUser ? [assignedUser.id] : [];
            const participantMentions = assignedUser ? [`<@${assignedUser.id}>`] : [];

            const taskEmbed = new EmbedBuilder()
                .setColor(COLORS.PENDING)
                .setTitle(`${EMBED_PREFIXES.TASK} ${taskName}`)
                .setDescription(taskDescription)
                .addFields(
                    {
                        name: FIELD_NAMES.STATUS,
                        value: `${EMOJIS.PENDING} ${STATUS.PENDING}`,
                        inline: true,
                    },
                    {
                        name: FIELD_NAMES.PARTICIPANTS,
                        value: participantMentions.join(', ') || DEFAULT_VALUES.NO_ONE,
                        inline: true,
                    },
                    {
                        name: FIELD_NAMES.COMPLETED_BY,
                        value: DEFAULT_VALUES.NO_ONE,
                        inline: true,
                    },
                )
                .setFooter({
                    text: participants.join(',') || ' ',
                })
                .setTimestamp();

            // Créer les boutons
            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("task_toggle_participation")
                    .setLabel(BUTTON_LABELS.JOIN_LEAVE)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji("👥"),
                new ButtonBuilder()
                    .setCustomId("task_status")
                    .setLabel(BUTTON_LABELS.START)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji("⚡"),
            );

            // Envoyer le message avec l'embed et les boutons
            await interaction.editReply({
                embeds: [taskEmbed],
                components: [buttons],
            });
        } catch (error) {
            await ErrorHandler.handleInteractionError(
                interaction,
                error,
                MESSAGES.ERROR_TASK_CREATION,
            );
            ErrorHandler.logError(LOG_MESSAGES.COMMAND_TASK, error, {
                userId: interaction.user.id,
                guildId: interaction.guildId,
                channelId: interaction.channelId,
            });
        }
    },
};
