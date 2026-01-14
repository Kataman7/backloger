const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        // Gérer les commandes slash
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`❌ Commande ${interaction.commandName} non trouvée.`);
                return;
            }

            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(`❌ Erreur lors de l'exécution de la commande ${interaction.commandName}:`, error);

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content: '❌ Une erreur est survenue lors de l\'exécution de cette commande.',
                        ephemeral: true
                    });
                } else {
                    await interaction.reply({
                        content: '❌ Une erreur est survenue lors de l\'exécution de cette commande.',
                        ephemeral: true
                    });
                }
            }
        }
        // Gérer les boutons
        else if (interaction.isButton()) {
            const button = client.buttons.get(interaction.customId);

            if (!button) {
                console.error(`❌ Bouton ${interaction.customId} non trouvé.`);
                return;
            }

            try {
                await button.execute(interaction, client);
            } catch (error) {
                console.error(`❌ Erreur lors de l'exécution du bouton ${interaction.customId}:`, error);

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content: '❌ Une erreur est survenue lors du traitement de ce bouton.',
                        ephemeral: true
                    });
                } else {
                    await interaction.reply({
                        content: '❌ Une erreur est survenue lors du traitement de ce bouton.',
                        ephemeral: true
                    });
                }
            }
        }
    }
};
