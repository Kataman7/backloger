/**
 * Gestionnaire d'erreurs centralisé pour TrelloBot
 */

const { EmbedBuilder } = require("discord.js");
const { COLORS, EMOJIS } = require("./constants");
const ArchiveFinder = require("./archiveFinder");

class ErrorHandler {
    /**
     * Crée un embed d'erreur
     * @param {string} title - Titre de l'erreur
     * @param {string} description - Description de l'erreur
     * @param {Error} [error] - Objet erreur optionnel
     * @returns {EmbedBuilder} - Embed formaté
     */
    static createErrorEmbed(title, description, error = null) {
        const embed = new EmbedBuilder()
            .setColor(COLORS.ERROR)
            .setTitle(`${EMOJIS.ERROR} ${title}`)
            .setDescription(description)
            .setTimestamp();

        if (error && process.env.NODE_ENV === "development") {
            const errorMessage = error.message || "Aucun détail disponible";
            const errorStack = error.stack
                ? `\`\`\`${error.stack.slice(0, 500)}\`\`\``
                : "Aucune stack trace";

            embed.addFields({
                name: "Message d'erreur",
                value: `\`${errorMessage}\``,
                inline: false,
            });
        }

        return embed;
    }

    /**
     * Gère une erreur d'interaction
     * @param {Interaction} interaction - L'interaction Discord
     * @param {Error} error - L'erreur survenue
     * @param {string} [context] - Contexte de l'erreur
     */
    static async handleInteractionError(
        interaction,
        error,
        context = "Une erreur est survenue",
    ) {
        console.error(`❌ Erreur dans ${context}:`, error);

        const errorEmbed = this.createErrorEmbed(
            "Erreur",
            context,
            process.env.NODE_ENV === "development" ? error : null,
        );

        try {
            if (interaction.deferred || interaction.replied) {
                await interaction.followUp({
                    embeds: [errorEmbed],
                    ephemeral: true,
                });
            } else {
                await interaction.reply({
                    embeds: [errorEmbed],
                    ephemeral: true,
                });
            }
        } catch (replyError) {
            console.error(
                "❌ Impossible d'envoyer le message d'erreur:",
                replyError,
            );
        }
    }

    /**
     * Gère une erreur de validation
     * @param {Interaction} interaction - L'interaction Discord
     * @param {string} message - Message d'erreur de validation
     */
    static async handleValidationError(interaction, message) {
        const embed = new EmbedBuilder()
            .setColor(COLORS.ERROR)
            .setTitle(`${EMOJIS.ERROR} Erreur de validation`)
            .setDescription(message)
            .setTimestamp();

        try {
            if (interaction.deferred || interaction.replied) {
                await interaction.followUp({
                    embeds: [embed],
                    ephemeral: true,
                });
            } else {
                await interaction.reply({
                    embeds: [embed],
                    ephemeral: true,
                });
            }
        } catch (error) {
            console.error(
                "❌ Impossible d'envoyer l'erreur de validation:",
                error,
            );
        }
    }

    /**
     * Vérifie si un channel archive est disponible
     * @param {GuildChannel} sourceChannel - Le channel source
     * @returns {Promise<{success: boolean, channel: Channel|null, error: string|null}>}
     */
    static async checkArchiveChannel(sourceChannel) {
        try {
            // Trouver ou créer le channel archive
            const archiveChannel =
                await ArchiveFinder.findOrCreateArchiveChannel(sourceChannel);

            if (!archiveChannel) {
                return {
                    success: false,
                    channel: null,
                    error:
                        'Impossible de trouver ou créer un channel "archive".\n' +
                        'Le bot a besoin de la permission "Gérer les salons" pour créer le channel automatiquement.',
                };
            }

            // Vérifier les permissions du bot dans le channel archive
            if (!ArchiveFinder.hasArchiveAccess(archiveChannel)) {
                return {
                    success: false,
                    channel: null,
                    error:
                        'Le bot n\'a pas les permissions nécessaires dans le channel "archive".\n' +
                        "Permissions requises: Voir le salon, Envoyer des messages, Intégrer des liens",
                };
            }

            return {
                success: true,
                channel: archiveChannel,
                error: null,
            };
        } catch (error) {
            console.error(
                "❌ Erreur lors de la vérification du channel archive:",
                error,
            );
            return {
                success: false,
                channel: null,
                error: `Erreur technique: ${error.message}`,
            };
        }
    }

    /**
     * Log une erreur avec contexte
     * @param {string} context - Contexte de l'erreur
     * @param {Error} error - L'erreur
     * @param {Object} [metadata] - Métadonnées supplémentaires
     */
    static logError(context, error, metadata = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            context,
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name,
            },
            metadata,
        };

        console.error("❌ Erreur loggée:", JSON.stringify(logEntry, null, 2));
    }

    /**
     * Gère une erreur de channel archive manquant
     * @param {Interaction} interaction - L'interaction Discord
     * @param {string} [customMessage] - Message personnalisé optionnel
     */
    static async handleMissingArchiveError(interaction, customMessage = null) {
        const message =
            customMessage ||
            "**Configuration requise:**\n" +
                'Aucun channel "archive" trouvé et impossible d\'en créer un automatiquement.\n\n' +
                "**Solutions possibles:**\n" +
                '1. Créez manuellement un channel nommé "archive" dans la même catégorie\n' +
                '2. Donnez au bot la permission "Gérer les salons" pour qu\'il puisse le créer\n' +
                "3. Assurez-vous que le bot a les permissions nécessaires dans le channel";

        await this.handleValidationError(interaction, message);
    }
}

module.exports = ErrorHandler;
