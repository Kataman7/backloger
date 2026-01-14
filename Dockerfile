# Utiliser une image Node.js officielle
FROM node:18-alpine

# Créer le répertoire de l'application
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Exposer le port (optionnel, pour monitoring)
EXPOSE 3000

# Variable d'environnement pour Node.js
ENV NODE_ENV=production

# Commande de démarrage
CMD ["node", "src/index.js"]
