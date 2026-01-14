/**
 * Fichier de test pour vérifier la configuration de TrelloBot
 * Version 2.0.0 - Configuration simplifiée pour Docker
 */

const { config } = require("dotenv");
const fs = require("fs");
const path = require("path");

// Charger les variables d'environnement
config();

console.log("🔧 Test de configuration TrelloBot v2.0");
console.log("========================================\n");

// Vérifier le fichier .env
console.log("1. Vérification du fichier .env:");
if (fs.existsSync(".env")) {
    console.log("   ✅ Fichier .env trouvé");

    const envContent = fs.readFileSync(".env", "utf8");
    const lines = envContent
        .split("\n")
        .filter((line) => line.trim() && !line.startsWith("#"));

    console.log(`   📊 ${lines.length} variables trouvées`);

    // Vérifier les variables requises
    const requiredVars = ["DISCORD_TOKEN"];
    const missingVars = [];
    const placeholderVars = [];

    for (const requiredVar of requiredVars) {
        const line = lines.find((l) => l.startsWith(`${requiredVar}=`));

        if (!line) {
            missingVars.push(requiredVar);
        } else if (line.includes("votre_") || line.includes("_ici")) {
            placeholderVars.push(requiredVar);
        }
    }

    if (missingVars.length > 0) {
        console.log(`   ❌ Variables manquantes: ${missingVars.join(", ")}`);
    } else {
        console.log("   ✅ Toutes les variables requises sont présentes");
    }

    if (placeholderVars.length > 0) {
        console.log(
            `   ⚠️  Variables avec valeurs par défaut: ${placeholderVars.join(", ")}`,
        );
        console.log(
            "   ℹ️  Remplacez ces valeurs par vos propres configurations",
        );
    }
} else {
    console.log("   ❌ Fichier .env non trouvé");
    console.log(
        "   ℹ️  Créez-le à partir de .env.example: cp .env.example .env",
    );
}
console.log();

// Vérifier la structure du projet
console.log("2. Vérification de la structure du projet:");
const requiredDirs = [
    "src",
    "src/commands",
    "src/buttons",
    "src/events",
    "src/utils",
];

const requiredFiles = [
    "src/index.js",
    "src/commands/task.js",
    "src/buttons/task_in_progress.js",
    "src/buttons/task_done.js",
    "src/events/ready.js",
    "src/events/interactionCreate.js",
    "src/utils/constants.js",
    "src/utils/errorHandler.js",
    "src/utils/archiveFinder.js",
    "package.json",
    "Dockerfile",
    "docker-compose.yml",
    "start.sh",
];

let allDirsOk = true;
for (const dir of requiredDirs) {
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
        console.log(`   ✅ ${dir}/`);
    } else {
        console.log(`   ❌ ${dir}/ (manquant)`);
        allDirsOk = false;
    }
}

let allFilesOk = true;
for (const file of requiredFiles) {
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
        console.log(`   ✅ ${file}`);
    } else {
        console.log(`   ❌ ${file} (manquant)`);
        allFilesOk = false;
    }
}
console.log();

// Vérifier les dépendances
console.log("3. Vérification des dépendances:");
if (fs.existsSync("package.json")) {
    try {
        const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

        console.log(`   📦 Nom: ${packageJson.name}`);
        console.log(`   🏷️  Version: ${packageJson.version}`);

        if (packageJson.dependencies) {
            const requiredDeps = ["discord.js", "dotenv"];
            const missingDeps = [];

            for (const dep of requiredDeps) {
                if (!packageJson.dependencies[dep]) {
                    missingDeps.push(dep);
                }
            }

            if (missingDeps.length > 0) {
                console.log(
                    `   ❌ Dépendances manquantes: ${missingDeps.join(", ")}`,
                );
            } else {
                console.log("   ✅ Toutes les dépendances sont déclarées");
            }
        }

        // Vérifier node_modules (optionnel pour Docker)
        if (fs.existsSync("node_modules")) {
            console.log(
                "   ✅ node_modules/ trouvé (pour développement local)",
            );
        } else {
            console.log("   ℹ️  node_modules/ non trouvé (normal pour Docker)");
        }
    } catch (error) {
        console.log(
            `   ❌ Erreur de lecture de package.json: ${error.message}`,
        );
    }
}
console.log();

// Vérifier la syntaxe des fichiers JavaScript
console.log("4. Vérification de la syntaxe JavaScript:");
const jsFiles = [
    "src/index.js",
    "src/commands/task.js",
    "src/buttons/task_in_progress.js",
    "src/buttons/task_done.js",
    "src/events/ready.js",
    "src/events/interactionCreate.js",
    "src/utils/constants.js",
    "src/utils/errorHandler.js",
    "src/utils/archiveFinder.js",
];

let syntaxOk = true;
for (const file of jsFiles) {
    if (fs.existsSync(file)) {
        try {
            require("vm").createScript(fs.readFileSync(file, "utf8"), file);
            console.log(`   ✅ ${file}`);
        } catch (error) {
            console.log(`   ❌ ${file}: ${error.message}`);
            syntaxOk = false;
        }
    }
}
console.log();

// Vérifier Docker
console.log("5. Vérification de la configuration Docker:");
if (fs.existsSync("Dockerfile")) {
    console.log("   ✅ Dockerfile trouvé");

    const dockerfile = fs.readFileSync("Dockerfile", "utf8");
    const lines = dockerfile.split("\n");

    // Vérifier les éléments essentiels
    const essentials = [
        "FROM node:",
        "WORKDIR",
        "COPY package",
        "RUN npm",
        "COPY .",
        "CMD",
    ];

    let essentialsFound = 0;
    for (const line of lines) {
        for (const essential of essentials) {
            if (line.includes(essential)) {
                essentialsFound++;
                break;
            }
        }
    }

    if (essentialsFound >= essentials.length) {
        console.log("   ✅ Dockerfile contient tous les éléments essentiels");
    } else {
        console.log(
            `   ⚠️  Dockerfile manque ${essentials.length - essentialsFound} éléments essentiels`,
        );
    }
} else {
    console.log("   ❌ Dockerfile non trouvé");
}

if (fs.existsSync("docker-compose.yml")) {
    console.log("   ✅ docker-compose.yml trouvé");
} else {
    console.log("   ❌ docker-compose.yml non trouvé");
}

if (fs.existsSync(".dockerignore")) {
    console.log("   ✅ .dockerignore trouvé");
} else {
    console.log("   ❌ .dockerignore non trouvé");
}
console.log();

// Vérifier les permissions du script de démarrage
console.log("6. Vérification des scripts:");
if (fs.existsSync("start.sh")) {
    console.log("   ✅ start.sh trouvé");

    try {
        const stats = fs.statSync("start.sh");
        const isExecutable = !!(stats.mode & 0o111);

        if (isExecutable) {
            console.log("   ✅ start.sh est exécutable");
        } else {
            console.log("   ⚠️  start.sh n'est pas exécutable");
            console.log("   ℹ️  Exécutez: chmod +x start.sh");
        }
    } catch (error) {
        console.log(
            `   ❌ Erreur de vérification des permissions: ${error.message}`,
        );
    }
} else {
    console.log("   ❌ start.sh non trouvé");
}
console.log();

// Résumé
console.log("📊 RÉSUMÉ DE LA CONFIGURATION");
console.log("==============================");

const checks = [
    { name: "Fichier .env", condition: fs.existsSync(".env") },
    { name: "Structure des dossiers", condition: allDirsOk },
    { name: "Fichiers essentiels", condition: allFilesOk },
    { name: "Syntaxe JavaScript", condition: syntaxOk },
    {
        name: "Configuration Docker",
        condition:
            fs.existsSync("Dockerfile") && fs.existsSync("docker-compose.yml"),
    },
];

let passedChecks = 0;
for (const check of checks) {
    const status = check.condition ? "✅" : "❌";
    console.log(`${status} ${check.name}`);
    if (check.condition) passedChecks++;
}

console.log(`\n📈 ${passedChecks}/${checks.length} vérifications passées`);

if (passedChecks === checks.length) {
    console.log(
        "\n🎉 Toutes les vérifications sont passées! Le bot est prêt à être lancé.",
    );
    console.log("\nCommandes disponibles:");
    console.log("  - Démarrer: ./start.sh");
    console.log("  - Voir les logs: ./start.sh logs");
    console.log("  - Vérifier l'état: ./start.sh status");
    console.log("  - Arrêter: ./start.sh stop");
} else {
    console.log(
        "\n⚠️  Certaines vérifications ont échoué. Corrigez les problèmes avant de lancer le bot.",
    );
    console.log("\nProchaines étapes:");
    console.log("  1. Configurez votre fichier .env avec votre token Discord");
    console.log(
        "  2. Vérifiez que tous les fichiers nécessaires sont présents",
    );
    console.log("  3. Exécutez chmod +x start.sh si nécessaire");
    console.log("  4. Relancez ce test: node test-config.js");
}

// Vérifier les valeurs des variables d'environnement si .env existe
if (fs.existsSync(".env")) {
    console.log("\n🔍 VALEURS DES VARIABLES D'ENVIRONNEMENT:");
    console.log("==========================================");

    const envContent = fs.readFileSync(".env", "utf8");
    const lines = envContent
        .split("\n")
        .filter((line) => line.trim() && !line.startsWith("#"));

    for (const line of lines) {
        const [key, ...valueParts] = line.split("=");
        const value = valueParts.join("=");

        if (key && value) {
            // Masquer les valeurs sensibles
            const displayValue = key.includes("TOKEN") ? "***MASQUÉ***" : value;
            console.log(`   ${key}=${displayValue}`);
        }
    }
}

console.log("\n💡 NOUVELLES FONCTIONNALITÉS v2.0:");
console.log("================================");
console.log("✅ Fonctionne sur TOUS les serveurs (pas de GUILD_ID requis)");
console.log('✅ Archive automatique: cherche/crée le channel "archive"');
console.log("✅ Configuration minimale: seul le token Discord requis");
console.log("✅ Docker Compose uniquement: prêt pour la production");
console.log("✅ Script de gestion complet: start.sh avec toutes les commandes");

console.log("\n💡 ASTUCES:");
console.log("==========");
console.log("1. Pour obtenir votre token Discord:");
console.log("   - Allez sur https://discord.com/developers/applications");
console.log("   - Créez une nouvelle application");
console.log('   - Allez dans "Bot" > "Reset Token"');
console.log("");
console.log("2. Permissions recommandées pour le bot:");
console.log("   - Manage Channels (pour créer automatiquement l'archive)");
console.log("   - Send Messages, Embed Links, Read Message History");
console.log("   - Use Slash Commands");
console.log("");
console.log("3. Pour tester rapidement:");
console.log("   - ./start.sh check  # Vérifie la configuration");
console.log("   - ./start.sh        # Lance le bot");
console.log("   - ./start.sh logs   # Voir les logs en temps réel");
console.log("");
console.log('4. Le bot cherche automatiquement un channel "archive":');
console.log("   - Dans la même catégorie que le channel actuel");
console.log("   - Sinon dans tout le serveur");
console.log("   - Sinon le crée automatiquement (si permissions)");

console.log("\n🚀 POUR COMMENCER:");
console.log("================");
console.log("1. Configurez votre .env avec votre token Discord");
console.log("2. Lancez le bot: ./start.sh");
console.log("3. Invitez le bot sur votre serveur avec le lien OAuth2");
console.log("4. Utilisez /task pour créer votre première tâche!");
console.log('5. Le channel "archive" sera créé automatiquement si nécessaire');

console.log("\n🐳 DOCKER COMMANDES:");
console.log("==================");
console.log("docker-compose up -d          # Démarrer");
console.log("docker-compose logs -f        # Voir les logs");
console.log("docker-compose down           # Arrêter");
console.log("docker-compose up -d --build  # Reconstruire");

console.log("\n📞 SUPPORT:");
console.log("==========");
console.log("Pour toute question, consultez les logs avec ./start.sh logs");
console.log("Ou vérifiez la configuration avec ./start.sh check");
