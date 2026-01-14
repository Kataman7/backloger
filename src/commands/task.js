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
} = require("../utils/constants");
const ErrorHandler = require("../utils/errorHandler");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("task")
        .setDescription("Crée une nouvelle tâche")
        .addStringOption((option) =>
            option
                .setName("nom")
                .setDescription("Nom de la tâche")
                .setRequired(true)
                .setMaxLength(LIMITS.TASK_NAME_MAX),
        )
        .addStringOption((option) =>
            option
                .setName("description")
                .setDescription("Description de la tâche")
                .setRequired(true)
                .setMaxLength(LIMITS.TASK_DESC_MAX),
        ),

    async execute(interaction, client) {
        try {
            await interaction.deferReply({ ephemeral: false });

            const taskName = interaction.options.getString("nom");
            const taskDescription =
                interaction.options.getString("description");
            const user = interaction.user;
            const channel = interaction.channel;

            // Validation des entrées
            if (!taskName || taskName.trim().length === 0) {
                await ErrorHandler.handleValidationError(
                    interaction,
                    "Le nom de la tâche ne peut pas être vide.",
                );
                return;
            }

            if (!taskDescription || taskDescription.trim().length === 0) {
                await ErrorHandler.handleValidationError(
                    interaction,
                    "La description de la tâche ne peut pas être vide.",
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
            const taskEmbed = new EmbedBuilder()
                .setColor(COLORS.PENDING)
                .setTitle(`📋 ${taskName}`)
                .setDescription(taskDescription)
                .addFields(
                    {
                        name: "Statut",
                        value: `${EMOJIS.PENDING} ${STATUS.PENDING}`,
                        inline: true,
                    },
                    {
                        name: "Assigné à",
                        value: "Personne",
                        inline: true,
                    },
                    {
                        name: "Terminé par",
                        value: "Personne",
                        inline: true,
                    },
                )
                .setFooter({
                    text: `Créé par ${user.username}`,
                    iconURL: user.displayAvatarURL(),
                })
                .setTimestamp();

            // Créer les boutons
            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("task_in_progress")
                    .setLabel("En cours")
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji("⚡"),
                new ButtonBuilder()
                    .setCustomId("task_done")
                    .setLabel("Terminée")
                    .setStyle(ButtonStyle.Success)
                    .setEmoji("✅"),
            );

            // Envoyer le message avec l'embed et les boutons
            await interaction.editReply({
                embeds: [taskEmbed],
                components: [buttons],
            });

            console.log(`✅ Tâche créée: "${taskName}" par ${user.tag}`);
            console.log(`📁 Channel d'archive: #${archiveCheck.channel.name}`);
        } catch (error) {
            await ErrorHandler.handleInteractionError(
                interaction,
                error,
                "Erreur lors de la création de la tâche",
            );
            ErrorHandler.logError("Commande /task", error, {
                userId: interaction.user.id,
                guildId: interaction.guildId,
                channelId: interaction.channelId,
            });
        }
    },
};
