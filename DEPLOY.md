# TrelloBot - Guide de Déploiement Rapide

## 🚀 Déploiement en 5 minutes

### 1. Préparation
```bash
# Clonez le projet
git clone <votre-repo>
cd trellobot

# Configurez l'environnement
cp .env.example .env
```

### 2. Configuration du Token Discord
Éditez le fichier `.env` :
```env
# REQUIS - Remplacez par votre token Discord
DISCORD_TOKEN=votre_token_ici

# OPTIONNEL
DEFAULT_PREFIX=!
NODE_ENV=production
PORT=3000
```

**Pour obtenir votre token Discord :**
1. Allez sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Créez une nouvelle application
3. Allez dans "Bot" → "Reset Token"
4. Copiez le token dans `.env`

### 3. Invitation du Bot
1. Sur le portail développeur, allez dans "OAuth2" → "URL Generator"
2. Sélectionnez les scopes : `bot`, `applications.commands`
3. Sélectionnez les permissions :
   - ✅ `Send Messages`
   - ✅ `Embed Links`
   - ✅ `Read Message History`
   - ✅ `Use Slash Commands`
   - ✅ `Manage Channels` (recommandé pour création automatique archive)
4. Utilisez l'URL générée pour inviter le bot sur votre serveur

### 4. Lancement avec Docker Compose
```bash
# Démarrer le bot
./start.sh

# OU directement avec Docker Compose
docker-compose up -d
```

### 5. Vérification
```bash
# Voir les logs
./start.sh logs

# Vérifier l'état
./start.sh status
```

## 📋 Fonctionnalités Clés

### ✅ Archive Automatique
- **Aucune configuration requise** : Pas d'ID de channel à renseigner
- **Recherche intelligente** : Cherche un channel nommé `archive` :
  1. Dans la même catégorie que le channel actuel
  2. Sinon dans tout le serveur
  3. Sinon le crée automatiquement (si permissions)
- **Permissions automatiques** : Channel en lecture seule pour les membres

### ✅ Multi-serveurs
- **Aucun GUILD_ID requis** : Fonctionne sur tous les serveurs
- **Commandes globales** : `/task` disponible partout
- **Isolation** : Chaque serveur a son propre channel archive

### ✅ Gestion Multi-utilisateurs
- **"En cours"** : Jusqu'à 10 utilisateurs peuvent s'assigner
- **"Terminée"** : Archive et désactive les boutons
- **Validation** : Empêche les doublons, limites de caractères

## 🛠️ Commandes de Gestion

### Script de gestion complet
```bash
./start.sh           # Démarrer
./start.sh stop      # Arrêter
./start.sh restart   # Redémarrer
./start.sh logs      # Voir les logs en temps réel
./start.sh status    # Vérifier l'état
./start.sh rebuild   # Reconstruire l'image Docker
./start.sh clean     # Nettoyer conteneurs et volumes
./start.sh check     # Vérifier la configuration
```

### Commandes Docker Compose directes
```bash
docker-compose up -d          # Démarrer
docker-compose logs -f        # Logs en temps réel
docker-compose down           # Arrêter
docker-compose ps             # Vérifier l'état
docker-compose up -d --build  # Reconstruire et redémarrer
```

## 🎮 Utilisation du Bot

### Créer une tâche
```
/task nom:"Nom de la tâche" description:"Description détaillée"
```

### Gérer les tâches
1. **Cliquez sur "En cours"** pour vous assigner
   - Plusieurs utilisateurs possibles
   - Limite : 10 utilisateurs maximum
2. **Cliquez sur "Terminée"** pour archiver
   - Copie dans le channel `archive`
   - Désactive les boutons sur l'original
   - Indique qui a terminé

### Channel Archive
- **Nom** : `archive` (insensible à la casse)
- **Création automatique** : Si le bot a `Manage Channels`
- **Permissions** : Lecture seule pour les membres
- **Contenu** : Tâches archivées avec date et utilisateur

## 🔧 Configuration Avancée

### Variables d'environnement (.env)
```env
# REQUIS
DISCORD_TOKEN=votre_token_ici

# OPTIONNEL
DEFAULT_PREFIX=!          # Préfixe pour commandes texte
NODE_ENV=production       # Environnement
PORT=3000                # Port (exposition optionnelle)
TZ=Europe/Paris          # Fuseau horaire
```

### Permissions Discord Recommandées
| Permission | Nécessaire | Pourquoi |
|------------|------------|----------|
| `Send Messages` | ✅ | Envoyer des messages |
| `Embed Links` | ✅ | Afficher les embeds |
| `Read Message History` | ✅ | Lire l'historique |
| `Use Slash Commands` | ✅ | Commandes slash |
| `Manage Channels` | ⭐ | Créer automatiquement l'archive |
| `Add Reactions` | ⭐ | Boutons interactifs |

## 🐛 Dépannage Rapide

### Le bot ne répond pas
```bash
# Vérifier les logs
./start.sh logs

# Vérifier le token
./start.sh check

# Redémarrer
./start.sh restart
```

### Erreur "Impossible de trouver/créer archive"
1. **Donnez `Manage Channels`** au bot
2. **Ou créez manuellement** un channel `archive`
3. **Vérifiez les permissions** dans le channel

### Les boutons ne fonctionnent pas
1. Vérifiez `Use Slash Commands`
2. Redémarrez le bot
3. Consultez les logs

### Problèmes Docker
```bash
# Vérifier Docker
docker ps

# Vérifier les logs
docker-compose logs

# Reconstruire
./start.sh rebuild
```

## 📊 Monitoring

### Logs
```bash
# Logs en temps réel
./start.sh logs

# Dernières erreurs
docker-compose logs trellobot | grep -i error

# Logs complets
docker-compose logs --tail=100
```

### Métriques
```bash
# Utilisation ressources
docker stats trellobot

# État des conteneurs
docker-compose ps

# Espace disque
docker system df
```

## 🔄 Mise à Jour

```bash
# Arrêter
./start.sh stop

# Mettre à jour
git pull origin main

# Redémarrer
./start.sh start

# OU en une commande
./start.sh restart
```

## 🗑️ Nettoyage

```bash
# Arrêter et nettoyer
./start.sh clean

# Nettoyer Docker
docker system prune -f

# Nettoyage complet
docker system prune -af
```

## 📁 Structure du Projet

```
trellobot/
├── src/                    # Code source
│   ├── commands/          # /task
│   ├── buttons/           # En cours/Terminée
│   ├── events/            # Événements Discord
│   └── utils/             # Utilitaires
├── .env                   # Configuration
├── Dockerfile            # Image Docker
├── docker-compose.yml    # Orchestration
├── start.sh             # Script de gestion
└── README.md            # Documentation complète
```

## 🎯 Points Forts

- ✅ **Zéro configuration serveur** : Pas d'ID à renseigner
- ✅ **Archive automatique** : Cherche/crée le channel `archive`
- ✅ **Multi-serveurs** : Fonctionne partout sans configuration
- ✅ **Dockerisé** : Prêt pour production
- ✅ **Script de gestion** : Commandes simplifiées
- ✅ **Gestion d'erreurs** : Messages clairs, logs détaillés
- ✅ **Sécurité** : Utilisateur non-root, secrets dans `.env`

## 📞 Support

### Premiers pas
1. `cp .env.example .env` + configurez votre token
2. `./start.sh`
3. Invitez le bot avec le lien OAuth2
4. `/task` pour créer votre première tâche

### En cas de problème
1. `./start.sh logs` - Consultez les logs
2. `./start.sh check` - Vérifiez la configuration
3. `./start.sh rebuild` - Reconstruisez l'image

### Ressources
- [Discord Developer Portal](https://discord.com/developers/applications)
- [Documentation Docker](https://docs.docker.com/)
- [Guide Discord.js](https://discordjs.guide/)

---

**💡 Prêt à démarrer ?**
```bash
# 1. Configuration
cp .env.example .env
# Éditez .env avec votre token Discord

# 2. Lancement
./start.sh

# 3. Invitation
# Utilisez le lien OAuth2 du portail développeur

# 4. Test
# Utilisez /task sur votre serveur Discord
```

**Le bot est maintenant opérationnel sur tous vos serveurs !** 🎉