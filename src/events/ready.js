const { Events } = require("discord.js");

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`✅ Bot prêt! Connecté en tant que ${client.user.tag}`);
        console.log(`📊 Servant ${client.guilds.cache.size} serveur(s)`);

        // Enregistrer les commandes slash globalement
        try {
            const commands = Array.from(client.commands.values()).map(
                (cmd) => cmd.data,
            );

            // Enregistrer les commandes globalement
            await client.application.commands.set(commands);
            console.log(
                `✅ ${commands.length} commande(s) slash enregistrée(s) globalement`,
            );

            // Afficher les serveurs où le bot est présent
            client.guilds.cache.forEach((guild) => {
                console.log(
                    `   📍 ${guild.name} (${guild.id}) - ${guild.memberCount} membres`,
                );
            });
        } catch (error) {
            console.error(
                "❌ Erreur lors de l'enregistrement des commandes:",
                error,
            );
        }
    },
};
