# TrelloBot - Guide de Démarrage Rapide

## 🚀 Installation Express

### 1. Cloner et configurer
```bash
# Clonez le projet
git clone <votre-repo>
cd trellobot

# Configurez l'environnement
cp .env.example .env
# Éditez .env avec vos informations Discord
```

### 2. Configurer Discord
1. **Obtenez votre token Discord :**
   - Allez sur [Discord Developer Portal](https://discord.com/developers/applications)
   - Créez une nouvelle application
   - Allez dans "Bot" → "Reset Token"
   - Copiez le token dans `.env` comme `DISCORD_TOKEN`

2. **Obtenez les IDs nécessaires :**
   - Activez le mode développeur dans Discord :
     - Paramètres → Avancé → Mode développeur
   - **Guild ID** : Clic droit sur votre serveur → Copier l'ID
   - **Archive Channel ID** : Clic droit sur le channel d'archive → Copier l'ID

3. **Invitez le bot sur votre serveur :**
   - Allez sur [Discord Developer Portal](https://discord.com/developers/applications)
   - Sélectionnez votre application
   - OAuth2 → URL Generator
   - Scopes : `bot`, `applications.commands`
   - Permissions :
     - `Send Messages`
     - `Embed Links`
     - `Read Message History`
     - `Use Slash Commands`
   - Utilisez l'URL générée pour inviter le bot

### 3. Lancer le bot

**Option A : Avec Node.js (Développement)**
```bash
# Installer les dépendances
npm install

# Vérifier la configuration
./start.sh check

# Lancer en mode développement
npm run dev
# OU
./start.sh dev
```

**Option B : Avec Docker (Production)**
```bash
# Construire l'image
docker build -t trellobot .

# Lancer le conteneur
docker run --env-file .env trellobot

# OU avec Docker Compose
docker-compose up -d
```

## 📋 Utilisation du Bot

### 1. Créer une tâche
```
/task nom:"Nom de la tâche" description:"Description détaillée"
```

### 2. Gérer les tâches
- **"En cours"** : Cliquez pour vous assigner à la tâche
  - Plusieurs utilisateurs peuvent s'assigner
  - Limite : 10 utilisateurs maximum
- **"Terminée"** : Cliquez pour archiver la tâche
  - La tâche est copiée dans le channel d'archive
  - Les boutons sont désactivés sur l'original

### 3. Vérifier l'archivage
- Les tâches terminées apparaissent dans le channel configuré dans `.env`
- Chaque archivage inclut :
  - La tâche complète
  - La date d'archivage
  - L'utilisateur qui a terminé

## 🔧 Configuration du Fichier `.env`

```env
# REQUIS - À configurer absolument
DISCORD_TOKEN=votre_token_ici
GUILD_ID=votre_guild_id_ici
ARCHIVE_CHANNEL_ID=votre_channel_archive_id_ici

# OPTIONNEL
DEFAULT_PREFIX=!
NODE_ENV=production
PORT=3000
```

## 🐛 Dépannage Rapide

### Le bot ne répond pas aux commandes
```bash
# Vérifiez que le bot est en ligne
./start.sh check

# Redémarrez le bot
npm run dev
```

### Erreur "Channel d'archive non configuré"
1. Vérifiez que `ARCHIVE_CHANNEL_ID` est défini dans `.env`
2. Vérifiez que l'ID est correct
3. Vérifiez que le bot a accès au channel

### Les boutons ne fonctionnent pas
1. Vérifiez les permissions du bot :
   - `Add Reactions`
   - `Use Slash Commands`
2. Redémarrez le bot pour recharger les commandes

## 📁 Structure des Fichiers

```
trellobot/
├── src/                    # Code source
│   ├── commands/          # Commandes slash (/task)
│   ├── buttons/           # Gestionnaires de boutons
│   ├── events/            # Événements Discord
│   └── utils/             # Utilitaires
├── .env                   # Configuration (à créer)
├── .env.example          # Template de configuration
├── Dockerfile            # Configuration Docker
├── docker-compose.yml    # Docker Compose
├── start.sh             # Script de démarrage
└── package.json         # Dépendances Node.js
```

## 🐳 Commandes Docker Utiles

```bash
# Construire et lancer
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down

# Reconstruire
docker-compose up -d --build

# Nettoyer
docker system prune -f
```

## 📞 Support

### Logs de débogage
```bash
# Mode développement
npm run dev  # Affiche les logs en direct

# Mode Docker
docker-compose logs -f trellobot

# Fichiers de logs
ls -la logs/  # Si configuré avec PM2
```

### Vérifications courantes
1. **Token Discord valide ?** → Vérifiez sur le portail développeur
2. **Permissions correctes ?** → Vérifiez l'invitation du bot
3. **IDs valides ?** → Utilisez le mode développeur Discord
4. **Channel d'archive accessible ?** → Vérifiez les permissions

## 🎯 Fonctionnalités Clés

✅ **Commande `/task`** - Création de tâches avec embed  
✅ **Boutons interactifs** - En cours / Terminée  
✅ **Multi-utilisateurs** - Plusieurs personnes peuvent s'assigner  
✅ **Archivage automatique** - Dans un channel dédié  
✅ **Configuration `.env`** - Tout configurable  
✅ **Dockerisé** - Prêt pour production  
✅ **Gestion d'erreurs** - Messages clairs en cas de problème  

## ⏱️ Démarrage en 5 minutes

1. **Minute 1** : Clonez et configurez `.env`
2. **Minute 2** : Obtenez vos IDs Discord
3. **Minute 3** : Installez les dépendances (`npm install`)
4. **Minute 4** : Lancez le bot (`npm run dev`)
5. **Minute 5** : Testez avec `/task`

## 🔄 Mise à jour

```bash
# Avec Git
git pull origin main
npm install
npm run dev

# Avec Docker
docker-compose down
git pull origin main
docker-compose up -d --build
```

---

**Prochaines étapes :**
1. Configurez votre `.env` avec vos vraies valeurs
2. Testez avec `./start.sh check`
3. Lancez avec `./start.sh dev`
4. Invitez vos collègues à utiliser le bot !

**Besoin d'aide ?** Consultez le README.md complet ou ouvrez une issue.