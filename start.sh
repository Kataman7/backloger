#!/bin/bash

# Script de démarrage simplifié pour TrelloBot avec Docker Compose
# Version: 2.0.0 - Docker Compose uniquement

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions d'affichage
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si Docker est installé
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker n'est pas installé."
        print_info "Veuillez installer Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi

    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
    print_success "Docker $DOCKER_VERSION détecté"
}

# Vérifier si Docker Compose est installé
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        # Essayer avec docker compose (nouvelle syntaxe)
        if docker compose version &> /dev/null; then
            print_success "Docker Compose (nouvelle syntaxe) détecté"
            DOCKER_COMPOSE_CMD="docker compose"
        else
            print_error "Docker Compose n'est pas installé."
            print_info "Veuillez installer Docker Compose: https://docs.docker.com/compose/install/"
            exit 1
        fi
    else
        DOCKER_COMPOSE_CMD="docker-compose"
        DOCKER_COMPOSE_VERSION=$($DOCKER_COMPOSE_CMD --version | cut -d' ' -f3 | cut -d',' -f1)
        print_success "Docker Compose $DOCKER_COMPOSE_VERSION détecté"
    fi
}

# Vérifier le fichier .env
check_env() {
    if [ ! -f ".env" ]; then
        print_warning "Fichier .env non trouvé."

        if [ -f ".env.example" ]; then
            print_info "Création du fichier .env à partir de .env.example..."
            cp .env.example .env
            print_success "Fichier .env créé."
            print_info "⚠️  IMPORTANT: Éditez le fichier .env avec votre token Discord avant de continuer"
            exit 1
        else
            print_error "Fichier .env.example non trouvé."
            exit 1
        fi
    fi

    # Vérifier que le token Discord est configuré
    if grep -q "votre_token_discord_ici" .env; then
        print_error "Token Discord non configuré dans .env"
        print_info "Veuillez obtenir un token sur: https://discord.com/developers/applications"
        print_info "Puis éditez le fichier .env avec votre token"
        exit 1
    fi

    print_success "Fichier .env vérifié"
}

# Construire et lancer avec Docker Compose
start_with_docker_compose() {
    print_info "Démarrage de TrelloBot avec Docker Compose..."

    # Vérifier si le conteneur existe déjà
    if [ "$($DOCKER_COMPOSE_CMD ps -q trellobot 2>/dev/null)" ]; then
        print_warning "Le conteneur TrelloBot est déjà en cours d'exécution."
        print_info "Voulez-vous le redémarrer? (y/N)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            print_info "Redémarrage du conteneur..."
            $DOCKER_COMPOSE_CMD down
        else
            print_info "Utilisation du conteneur existant..."
            $DOCKER_COMPOSE_CMD up -d
            return
        fi
    fi

    # Construire et lancer
    $DOCKER_COMPOSE_CMD up -d --build

    print_success "TrelloBot démarré avec succès!"
    print_info "Pour voir les logs: $DOCKER_COMPOSE_CMD logs -f"
    print_info "Pour arrêter: $DOCKER_COMPOSE_CMD down"
}

# Arrêter avec Docker Compose
stop_with_docker_compose() {
    print_info "Arrêt de TrelloBot..."
    $DOCKER_COMPOSE_CMD down
    print_success "TrelloBot arrêté"
}

# Voir les logs
show_logs() {
    print_info "Affichage des logs (Ctrl+C pour quitter)..."
    $DOCKER_COMPOSE_CMD logs -f
}

# Vérifier l'état
check_status() {
    print_info "État des conteneurs:"
    $DOCKER_COMPOSE_CMD ps

    print_info "\nLogs récents:"
    $DOCKER_COMPOSE_CMD logs --tail=20
}

# Nettoyer
cleanup() {
    print_info "Nettoyage des conteneurs Docker..."
    $DOCKER_COMPOSE_CMD down -v
    print_success "Nettoyage terminé"
}

# Reconstruire
rebuild() {
    print_info "Reconstruction de l'image Docker..."
    $DOCKER_COMPOSE_CMD up -d --build --force-recreate
    print_success "Reconstruction terminée"
}

# Afficher l'aide
show_help() {
    echo "Usage: ./start.sh [COMMANDE]"
    echo ""
    echo "Commandes:"
    echo "  start     Démarrer le bot (défaut)"
    echo "  stop      Arrêter le bot"
    echo "  restart   Redémarrer le bot"
    echo "  logs      Afficher les logs"
    echo "  status    Vérifier l'état"
    echo "  rebuild   Reconstruire l'image"
    echo "  clean     Nettoyer les conteneurs et volumes"
    echo "  check     Vérifier la configuration"
    echo "  help      Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  ./start.sh           # Démarrer le bot"
    echo "  ./start.sh logs      # Voir les logs"
    echo "  ./start.sh status    # Vérifier l'état"
    echo "  ./start.sh clean     # Nettoyer"
}

# Fonction principale
main() {
    COMMAND="start"

    # Traiter les arguments
    case "$1" in
        "start"|"")
            COMMAND="start"
            ;;
        "stop")
            COMMAND="stop"
            ;;
        "restart")
            COMMAND="restart"
            ;;
        "logs")
            COMMAND="logs"
            ;;
        "status")
            COMMAND="status"
            ;;
        "rebuild")
            COMMAND="rebuild"
            ;;
        "clean"|"cleanup")
            COMMAND="clean"
            ;;
        "check")
            COMMAND="check"
            ;;
        "help"|"-h"|"--help")
            show_help
            exit 0
            ;;
        *)
            print_error "Commande invalide: $1"
            show_help
            exit 1
            ;;
    esac

    # Exécuter les vérifications de base
    check_docker
    check_docker_compose

    if [ "$COMMAND" != "check" ]; then
        check_env
    fi

    # Exécuter la commande
    case "$COMMAND" in
        "start")
            start_with_docker_compose
            ;;
        "stop")
            stop_with_docker_compose
            ;;
        "restart")
            stop_with_docker_compose
            sleep 2
            start_with_docker_compose
            ;;
        "logs")
            show_logs
            ;;
        "status")
            check_status
            ;;
        "rebuild")
            rebuild
            ;;
        "clean")
            cleanup
            ;;
        "check")
            print_success "✅ Configuration vérifiée avec succès!"
            print_info "Token Discord: $(grep -o 'DISCORD_TOKEN=.*' .env | cut -d'=' -f2 | head -c 10)..."
            print_info "Prêt à démarrer avec: ./start.sh"
            ;;
    esac
}

# Gérer les signaux
trap 'print_info "Interruption reçue, arrêt en cours..."; $DOCKER_COMPOSE_CMD down; exit 0' INT TERM

# Exécuter la fonction principale
main "$@"
