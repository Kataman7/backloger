# TrelloBot - Documentation Docker

## 🐳 Déploiement avec Docker

Cette documentation explique comment déployer TrelloBot avec Docker et Docker Compose.

## 📋 Prérequis

- Docker 20.10+ et Docker Compose 2.0+
- Fichier `.env` correctement configuré
- 512MB de RAM minimum

## 🚀 Démarrage Rapide

### 1. Configuration
```bash
# Clonez le projet
git clone <repository>
cd trellobot

# Configurez l'environnement
cp .env.example .env
nano .env  # Éditez avec vos informations Discord
```

### 2. Construction et Lancement
```bash
# Avec Docker Compose (recommandé)
docker-compose up -d

# Avec Docker seul
docker build -t trellobot .
docker run --env-file .env -d --name trellobot trellobot
```

### 3. Vérification
```bash
# Vérifiez que le conteneur tourne
docker ps

# Voir les logs
docker-compose logs -f
# OU
docker logs -f trellobot
```

## 🏗️ Structure Docker

### Dockerfile
```dockerfile
FROM node:18-alpine          # Image Node.js légère
WORKDIR /app                 # Répertoire de travail
COPY package*.json ./        # Copie des dépendances
RUN npm ci --only=production # Installation des dépendances
COPY . .                     # Copie du code source
USER nodejs                  # Utilisateur non-root pour la sécurité
EXPOSE 3000                  # Port exposé (optionnel)
CMD ["node", "src/index.js"] # Commande de démarrage
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  trellobot:
    build: .                # Construction depuis le Dockerfile
    container_name: trellobot
    restart: unless-stopped # Redémarrage automatique
    env_file: .env          # Chargement des variables d'environnement
    volumes:
      - ./logs:/app/logs    # Montage des logs
    healthcheck:            # Vérification de santé
      test: ["CMD", "node", "-e", "console.log('Health check OK')"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## 🔧 Configuration Avancée

### Variables d'Environnement Docker
```env
# REQUIS pour Docker
DISCORD_TOKEN=your_token_here
GUILD_ID=your_guild_id_here
ARCHIVE_CHANNEL_ID=your_archive_channel_id_here

# OPTIONNEL
NODE_ENV=production
PORT=3000
TZ=Europe/Paris            # Fuseau horaire
NODE_OPTIONS=--max-old-space-size=512  # Limite mémoire
```

### Configuration Docker Compose Personnalisée
Créez un fichier `docker-compose.override.yml` pour la personnalisation :
```yaml
version: '3.8'
services:
  trellobot:
    environment:
      - NODE_ENV=production
      - TZ=Europe/Paris
    ports:
      - "3000:3000"        # Exposition du port (optionnel)
    volumes:
      - ./data:/app/data   # Données persistantes
      - ./logs:/app/logs   # Logs persistants
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

## 📊 Gestion des Conteneurs

### Commandes Essentielles
```bash
# Démarrer
docker-compose up -d

# Arrêter
docker-compose down

# Redémarrer
docker-compose restart

# Reconstruire
docker-compose up -d --build

# Voir les logs
docker-compose logs -f trellobot

# Accéder au shell du conteneur
docker-compose exec trellobot sh

# Voir l'utilisation des ressources
docker stats trellobot
```

### Surveillance et Maintenance
```bash
# Vérifier l'état des conteneurs
docker-compose ps

# Voir les logs en temps réel
docker-compose logs --tail=100 -f

# Nettoyer les conteneurs arrêtés
docker system prune -f

# Nettoyer les images non utilisées
docker image prune -f

# Vérifier l'espace disque
docker system df
```

## 🔒 Sécurité

### Bonnes Pratiques
1. **Utilisateur non-root** : Le Dockerfile utilise l'utilisateur `nodejs`
2. **Secrets** : Les tokens sont passés via `.env` (jamais dans le code)
3. **Mises à jour** : Maintenez l'image Node.js à jour
4. **Volumes** : Montez les logs en lecture seule si possible

### Configuration Sécurisée
```yaml
# docker-compose.secure.yml
services:
  trellobot:
    read_only: true                    # Système de fichiers en lecture seule
    tmpfs:
      - /tmp                           # Répertoire temporaire en mémoire
    security_opt:
      - no-new-privileges:true         # Empêche l'élévation de privilèges
    cap_drop:
      - ALL                            # Supprime toutes les capacités
    cap_add:
      - NET_BIND_SERVICE               # Autorise uniquement la liaison réseau
```

## 🐛 Dépannage Docker

### Problèmes Courants

#### 1. Le conteneur s'arrête immédiatement
```bash
# Vérifiez les logs
docker logs trellobot

# Vérifiez les variables d'environnement
docker-compose config

# Lancez en mode interactif pour le débogage
docker-compose run --rm trellobot sh
```

#### 2. Erreur de permission
```bash
# Vérifiez les permissions des volumes
ls -la logs/

# Corrigez les permissions
sudo chown -R $USER:$USER logs/
```

#### 3. Problèmes de réseau
```bash
# Vérifiez la connectivité
docker-compose exec trellobot ping -c 3 google.com

# Vérifiez les ports
netstat -tulpn | grep 3000
```

#### 4. Problèmes de mémoire
```bash
# Vérifiez l'utilisation mémoire
docker stats trellobot

# Augmentez la limite mémoire
# Dans docker-compose.override.yml :
deploy:
  resources:
    limits:
      memory: 1G
```

### Scripts de Dépannage
```bash
#!/bin/bash
# scripts/docker-troubleshoot.sh

echo "🔍 Diagnostic Docker TrelloBot"
echo "=============================="

# 1. Vérifier Docker
echo "1. Vérification Docker:"
docker --version
docker-compose --version

# 2. Vérifier les conteneurs
echo "2. Conteneurs en cours:"
docker-compose ps

# 3. Vérifier les logs
echo "3. Derniers logs:"
docker-compose logs --tail=50

# 4. Vérifier les ressources
echo "4. Utilisation ressources:"
docker stats --no-stream trellobot

# 5. Vérifier le réseau
echo "5. Vérification réseau:"
docker-compose exec trellobot node -e "console.log('Connectivité OK')"
```

## 📈 Monitoring

### Logs Structurés
Les logs sont disponibles dans :
- `logs/pm2-error.log` : Erreurs
- `logs/pm2-out.log` : Sortie standard
- `logs/pm2-combined.log` : Logs combinés

### Métriques Docker
```bash
# Statistiques en temps réel
docker stats trellobot

# Utilisation disque
docker system df

# Inspection détaillée
docker inspect trellobot
```

### Intégration avec des Outils
```yaml
# Exemple avec Prometheus (optionnel)
prometheus:
  image: prom/prometheus:latest
  ports:
    - "9090:9090"
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
  command:
    - '--config.file=/etc/prometheus/prometheus.yml'
```

## 🚢 Déploiement en Production

### 1. Préparation
```bash
# Construire l'image de production
docker build -t trellobot:prod .

# Tagger pour un registry
docker tag trellobot:prod yourregistry/trellobot:latest

# Pousser vers le registry
docker push yourregistry/trellobot:latest
```

### 2. Déploiement
```bash
# Récupérer l'image
docker pull yourregistry/trellobot:latest

# Lancer avec des variables d'environnement sécurisées
docker run -d \
  --name trellobot-prod \
  --env-file /secrets/.env \
  --restart unless-stopped \
  --memory=512m \
  yourregistry/trellobot:latest
```

### 3. Orchestration (Kubernetes)
```yaml
# trellobot-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: trellobot
spec:
  replicas: 1
  selector:
    matchLabels:
      app: trellobot
  template:
    metadata:
      labels:
        app: trellobot
    spec:
      containers:
      - name: trellobot
        image: yourregistry/trellobot:latest
        envFrom:
        - secretRef:
            name: trellobot-secrets
        resources:
          limits:
            memory: "512Mi"
            cpu: "500m"
```

## 🔄 Mise à Jour

### Mise à Jour du Bot
```bash
# 1. Arrêter l'ancienne version
docker-compose down

# 2. Récupérer les nouvelles modifications
git pull origin main

# 3. Reconstruire
docker-compose up -d --build

# 4. Vérifier
docker-compose logs --tail=20 -f
```

### Mise à Jour de Docker
```bash
# Mise à jour de l'image Node.js
# Modifiez la première ligne du Dockerfile :
FROM node:20-alpine  # Au lieu de node:18-alpine

# Puis reconstruisez
docker-compose up -d --build
```

## 🗑️ Nettoyage

```bash
# Arrêter et supprimer les conteneurs
docker-compose down -v

# Supprimer les images non utilisées
docker image prune -af

# Supprimer les volumes non utilisés
docker volume prune -f

# Nettoyage complet
docker system prune -af
```

## 📞 Support

### Ressources Utiles
- [Documentation Docker](https://docs.docker.com/)
- [Discord.js avec Docker](https://discordjs.guide/#before-you-begin)
- [Best Practices Docker](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

### Problèmes Connus
1. **Alpine Linux et Discord.js** : Certaines dépendances peuvent nécessiter des packages supplémentaires
2. **Mémoire limitée** : Augmentez `NODE_OPTIONS` si nécessaire
3. **Fuseau horaire** : Définissez `TZ` pour les dates correctes

### Obtenir de l'Aide
```bash
# Version Docker
docker --version

# Informations système
docker system info

# Diagnostic
docker-compose config
```

---
**Note** : Pour toute question, consultez les logs avec `docker-compose logs -f` ou ouvrez une issue sur le repository.