# TrelloBot - Bot Discord Dockerisé de Gestion de Tâches

Un bot Discord complet et professionnel pour créer, suivre et archiver des tâches avec des boutons interactifs. Conçu pour fonctionner sur tous les serveurs avec archivage automatique.

## 🚀 Fonctionnalités

### 📋 Commande `/task`
- Crée une nouvelle tâche avec nom et description
- Envoie un embed interactif avec statut et informations
- Validation des entrées (longueurs maximales, champs requis)

### 🔘 Boutons Interactifs
- **"En cours"** : Permet à plusieurs utilisateurs de s'assigner à la tâche
  - Gestion multi-utilisateurs (jusqu'à 10 personnes)
  - Empêche les doublons
  - Met à jour l'embed en temps réel
- **"Terminée"** : Archive automatiquement la tâche
  - Cherche un channel nommé `archive` dans la même catégorie
  - Crée le channel automatiquement si nécessaire (avec permissions)
  - Copie l'embed dans le channel d'archive
  - Marque l'original comme terminé et désactive les boutons

### ⚙️ Configuration Automatique
- **Aucun ID de serveur requis** : Fonctionne sur tous les serveurs
- **Archive automatique** : Cherche/crée le channel `archive` dynamiquement
- **Configuration minimale** : Seul le token Discord est requis

### 🐳 Dockerisé
- Prêt pour la production avec Docker Compose
- Gestion automatique des dépendances
- Logs persistants et redémarrage automatique
- Script de gestion complet

## 📋 Prérequis

- **Docker** et **Docker Compose**
- Un token de bot Discord
- Permissions Discord : `applications.commands`, `bot` avec permissions de base

## 🔧 Installation Rapide

### 1. Cloner et configurer
```bash
git clone <repository-url>
cd trellobot
cp .env.example .env
```

### 2. Configurer le token Discord
Éditez le fichier `.env` :
```env
# Token du bot Discord (obtenu sur https://discord.com/developers/applications)
DISCORD_TOKEN=votre_token_ici

# Configuration optionnelle
DEFAULT_PREFIX=!
NODE_ENV=production
PORT=3000
```

### 3. Obtenir le token Discord
1. Allez sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Créez une nouvelle application
3. Allez dans "Bot" → "Reset Token"
4. Copiez le token dans `.env`

### 4. Inviter le bot sur votre serveur
1. Sur le portail développeur, allez dans "OAuth2" → "URL Generator"
2. Sélectionnez les scopes : `bot`, `applications.commands`
3. Sélectionnez les permissions :
   - `Send Messages`
   - `Embed Links`
   - `Read Message History`
   - `Use Slash Commands`
   - `Manage Channels` (pour créer automatiquement le channel archive)
4. Utilisez l'URL générée pour inviter le bot

## 🚀 Lancement

### Avec le script de gestion
```bash
# Démarrer le bot
./start.sh

# Voir les logs
./start.sh logs

# Vérifier l'état
./start.sh status

# Arrêter le bot
./start.sh stop

# Redémarrer
./start.sh restart

# Reconstruire l'image
./start.sh rebuild

# Nettoyer
./start.sh clean

# Vérifier la configuration
./start.sh check
```

### Commandes Docker Compose directes
```bash
# Démarrer
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down

# Reconstruire
docker-compose up -d --build
```

## 🎮 Utilisation

### Créer une tâche
```
/task nom:"Nom de la tâche" description:"Description détaillée de la tâche"
```

### Gérer les tâches
1. **Cliquez sur "En cours"** pour vous assigner à la tâche
   - Plusieurs utilisateurs peuvent s'assigner
   - Limite : 10 utilisateurs maximum
2. **Cliquez sur "Terminée"** pour archiver la tâche
   - La tâche est copiée dans le channel `archive`
   - Si aucun channel `archive` n'existe, il est créé automatiquement
   - Les boutons sont désactivés sur l'original

### Channel Archive Automatique
Le bot cherche automatiquement un channel nommé `archive` :
1. **Dans la même catégorie** que le channel où la tâche a été créée
2. **Sinon dans tout le serveur**
3. **Sinon il le crée automatiquement** (si le bot a la permission `Manage Channels`)

Le channel archive créé automatiquement :
- Est en lecture seule pour les membres
- A une description explicative
- Seul le bot peut y envoyer des messages

## 📁 Structure du Projet

```
trellobot/
├── src/                    # Code source
│   ├── commands/          # Commandes slash (/task)
│   ├── buttons/           # Gestionnaires de boutons
│   ├── events/            # Événements Discord
│   └── utils/             # Utilitaires
│       ├── constants.js   # Constantes
│       ├── errorHandler.js # Gestion d'erreurs
│       └── archiveFinder.js # Recherche archive automatique
├── .env                   # Configuration (à créer)
├── .env.example          # Template de configuration
├── Dockerfile            # Configuration Docker
├── docker-compose.yml    # Docker Compose
├── start.sh             # Script de gestion Docker
├── test-config.js       # Test de configuration
└── package.json         # Dépendances Node.js
```

## 🔧 Configuration

### Variables d'environnement (.env)

| Variable | Description | Requis | Défaut |
|----------|-------------|---------|---------|
| `DISCORD_TOKEN` | Token du bot Discord | ✅ | - |
| `DEFAULT_PREFIX` | Préfixe pour commandes texte | ❌ | `!` |
| `NODE_ENV` | Environnement Node.js | ❌ | `production` |
| `PORT` | Port pour le serveur | ❌ | `3000` |

### Permissions Discord Requises

**Minimum :**
- `Send Messages`
- `Embed Links`
- `Read Message History`
- `Use Slash Commands`

**Recommandé (pour création automatique archive) :**
- `Manage Channels`

## 🐛 Dépannage

### Le bot ne répond pas aux commandes
```bash
# Vérifier les logs
./start.sh logs

# Vérifier que le token est correct
./start.sh check

# Redémarrer
./start.sh restart
```

### Erreur "Impossible de trouver/créer le channel archive"
1. **Donnez au bot la permission `Manage Channels`**
2. **Ou créez manuellement un channel nommé `archive`**
3. **Vérifiez les permissions dans le channel archive**

### Les boutons ne fonctionnent pas
1. Vérifiez que le bot a la permission `Use Slash Commands`
2. Redémarrez le bot pour recharger les commandes
3. Vérifiez les logs pour des erreurs

### Problèmes Docker
```bash
# Vérifier que Docker tourne
docker ps

# Vérifier les logs Docker
docker-compose logs

# Reconstruire l'image
./start.sh rebuild
```

## 📊 Logs et Monitoring

### Logs Docker
```bash
# Logs en temps réel
./start.sh logs

# Derniers logs
docker-compose logs --tail=50

# Logs d'erreurs uniquement
docker-compose logs trellobot | grep ERROR
```

### Fichiers de logs
Les logs sont montés dans le volume `./logs/` :
- `trellobot.log` : Logs de l'application
- Logs Docker dans la sortie standard

## 🔄 Mise à Jour

```bash
# Arrêter le bot
./start.sh stop

# Mettre à jour le code
git pull origin main

# Redémarrer
./start.sh start

# Ou en une commande
./start.sh restart
```

## 🗑️ Nettoyage

```bash
# Arrêter et supprimer les conteneurs/volumes
./start.sh clean

# Nettoyer les images Docker non utilisées
docker system prune -f

# Nettoyage complet Docker
docker system prune -af
```

## 🛠️ Développement

### Structure du code
- **Modulaire** : Séparation commandes/boutons/événements
- **Gestion d'erreurs** : Centralisée avec messages clairs
- **Configuration** : Variables d'environnement uniquement
- **Logs** : Structurés et informatifs

### Ajouter une fonctionnalité
1. **Nouvelle commande** : Ajouter dans `src/commands/`
2. **Nouveau bouton** : Ajouter dans `src/buttons/`
3. **Nouvel événement** : Ajouter dans `src/events/`
4. **Tester** : `./start.sh rebuild` puis `./start.sh logs`

## 📄 Licence

MIT

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Ouvrir une issue pour signaler un bug
2. Proposer une nouvelle fonctionnalité
3. Soumettre une pull request

## 📞 Support

Pour toute question ou problème :
1. Consultez les logs avec `./start.sh logs`
2. Vérifiez la configuration avec `./start.sh check`
3. Ouvrez une issue sur le repository

---

**💡 Astuce** : Pour un déploiement rapide, suivez simplement :
1. `cp .env.example .env` + configurez votre token
2. `./start.sh`
3. Invitez le bot avec le lien OAuth2
4. Utilisez `/task` pour créer votre première tâche !