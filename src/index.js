const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { config } = require('dotenv');
const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement
config();

// Créer une instance du client Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
});

// Collections pour stocker les commandes et les interactions
client.commands = new Collection();
client.buttons = new Collection();

// Charger les commandes
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        // La commande manque une propriété "data" ou "execute"
    }
}

// Charger les gestionnaires de boutons
const buttonsPath = path.join(__dirname, 'buttons');
if (fs.existsSync(buttonsPath)) {
    const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));

    for (const file of buttonFiles) {
        const filePath = path.join(buttonsPath, file);
        const button = require(filePath);

        if ('customId' in button && 'execute' in button) {
            client.buttons.set(button.customId, button);
        } else {
            // Le bouton manque une propriété "customId" ou "execute"
        }
    }
}

// Charger les événements
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// Gestionnaire d'erreurs global
process.on('unhandledRejection', error => {
    console.error('❌ Erreur non gérée:', error);
});

process.on('uncaughtException', error => {
    console.error('❌ Exception non attrapée:', error);
});

// Connexion au bot Discord
client.login(process.env.DISCORD_TOKEN)
    .then(() => {
        // Bot connecté
    })
    .catch(error => {
        console.error('❌ Erreur de connexion:', error);
        process.exit(1);
    });

module.exports = { client };
