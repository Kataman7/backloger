/**
 * Utilitaire pour trouver le channel archive dans Discord
 * Le bot cherche un channel nommé "archive" dans la même catégorie
 * que le channel où l'interaction a eu lieu
 */

const { ChannelType } = require('discord.js');

class ArchiveFinder {
    /**
     * Trouve le channel archive dans la même catégorie que le channel source
     * @param {GuildChannel} sourceChannel - Le channel où l'interaction a eu lieu
     * @returns {Promise<TextChannel|null>} - Le channel archive trouvé ou null
     */
    static async findArchiveChannel(sourceChannel) {
        try {
            const guild = sourceChannel.guild;
            const sourceCategory = sourceChannel.parent;

            // Si le channel source a une catégorie, chercher dans cette catégorie
            if (sourceCategory) {
                const archiveChannel = sourceCategory.children.cache.find(channel =>
                    channel.type === ChannelType.GuildText &&
                    channel.name.toLowerCase() === 'archive'
                );

                if (archiveChannel) {
                    console.log(`✅ Channel archive trouvé dans la catégorie "${sourceCategory.name}": #${archiveChannel.name}`);
                    return archiveChannel;
                }

                console.log(`ℹ️ Aucun channel "archive" trouvé dans la catégorie "${sourceCategory.name}"`);
            } else {
                console.log(`ℹ️ Le channel source n'est pas dans une catégorie, impossible de trouver un channel archive`);
            }

            return null;

        } catch (error) {
            console.error('❌ Erreur lors de la recherche du channel archive:', error);
            return null;
        }
    }

    /**
     * Crée un channel archive dans la même catégorie que le channel source
     * @param {GuildChannel} sourceChannel - Le channel où l'interaction a eu lieu
     * @returns {Promise<TextChannel|null>} - Le channel archive créé ou null
     */
    static async createArchiveChannel(sourceChannel) {
        try {
            const guild = sourceChannel.guild;
            const sourceCategory = sourceChannel.parent;

            console.log(`🛠️ Tentative de création du channel "archive"...`);

            const channelOptions = {
                name: 'archive',
                type: ChannelType.GuildText,
                topic: 'Channel pour archiver les tâches terminées de TrelloBot',
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        deny: ['SendMessages'],
                        allow: ['ViewChannel', 'ReadMessageHistory']
                    }
                ]
            };

            // Si le channel source a une catégorie, créer dans cette catégorie
            if (sourceCategory) {
                channelOptions.parent = sourceCategory.id;
            }

            const archiveChannel = await guild.channels.create(channelOptions);

            console.log(`✅ Channel "archive" créé: #${archiveChannel.name}`);

            // Envoyer un message de bienvenue
            await archiveChannel.send({
                embeds: [{
                    color: 0x0099FF,
                    title: '📁 Channel Archive TrelloBot',
                    description: 'Ce channel est utilisé pour archiver automatiquement les tâches terminées.\n\n' +
                                '**Fonctionnement :**\n' +
                                '• Les tâches marquées comme "Terminée" seront copiées ici\n' +
                                '• Ce channel est en lecture seule pour les membres\n' +
                                '• Seul le bot peut envoyer des messages ici',
                    timestamp: new Date()
                }]
            });

            return archiveChannel;

        } catch (error) {
            console.error('❌ Erreur lors de la création du channel archive:', error);
            return null;
        }
    }

    /**
     * Trouve ou crée un channel archive
     * @param {GuildChannel} sourceChannel - Le channel où l'interaction a eu lieu
     * @returns {Promise<TextChannel|null>} - Le channel archive trouvé/créé ou null
     */
    static async findOrCreateArchiveChannel(sourceChannel) {
        // D'abord essayer de trouver un channel archive existant
        const existingArchive = await this.findArchiveChannel(sourceChannel);

        if (existingArchive) {
            return existingArchive;
        }

        // Vérifier si le channel source a une catégorie
        const sourceCategory = sourceChannel.parent;
        if (!sourceCategory) {
            console.log(`ℹ️ Le channel source n'est pas dans une catégorie, impossible de créer un channel archive`);
            return null;
        }

        // Si aucun trouvé, essayer d'en créer un dans la catégorie
        console.log(`ℹ️ Aucun channel "archive" trouvé dans la catégorie, tentative de création...`);

        try {
            // Vérifier les permissions du bot
            const permissions = sourceChannel.permissionsFor(sourceChannel.guild.members.me);

            if (!permissions.has('ManageChannels')) {
                console.log('❌ Le bot n\'a pas la permission "ManageChannels" pour créer un channel archive');
                return null;
            }

            const newArchive = await this.createArchiveChannel(sourceChannel);
            return newArchive;

        } catch (error) {
            console.error('❌ Impossible de créer le channel archive:', error);
            return null;
        }
    }

    /**
     * Vérifie si le bot a accès au channel archive
     * @param {TextChannel} archiveChannel - Le channel archive à vérifier
     * @returns {boolean} - True si le bot a les permissions nécessaires
     */
    static hasArchiveAccess(archiveChannel) {
        try {
            const permissions = archiveChannel.permissionsFor(archiveChannel.guild.members.me);

            const requiredPermissions = ['ViewChannel', 'SendMessages', 'EmbedLinks'];
            const missingPermissions = [];

            for (const permission of requiredPermissions) {
                if (!permissions.has(permission)) {
                    missingPermissions.push(permission);
                }
            }

            if (missingPermissions.length > 0) {
                console.log(`❌ Permissions manquantes dans le channel archive: ${missingPermissions.join(', ')}`);
                return false;
            }

            return true;

        } catch (error) {
            console.error('❌ Erreur lors de la vérification des permissions:', error);
            return false;
        }
    }
}

module.exports = ArchiveFinder;
