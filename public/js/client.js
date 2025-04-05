// ⚡ Fonction pour récupérer les données utilisateur
async function fetchUserData() {
    try {
        const response = await fetch("/api/user_client", {
            credentials: "include"  // Assure-toi que le cookie est inclus dans la requête
        });

        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des données utilisateur.");
        }

        const data = await response.json();
        if (!data.user) throw new Error("Utilisateur non authentifié");

        window.clientData = data.user;
        return data.user;
    } catch (error) {
        console.error("Erreur lors du chargement des données utilisateur :", error);
        alert("Veuillez vous reconnecter."); // Redirection vers la page de connexion si l'utilisateur est déconnecté
    }
}


// ⚡ Fonction pour charger le tableau de bord
async function loadDashboard() {
    try {
        const response = await fetch("/api/dashboard", { credentials: "include" });
        const data = await response.text(); // On attend la réponse complète en HTML

        document.querySelector("#main-content").innerHTML = data;

        // Ajout des événements une fois le contenu chargé
        setupMenu();
        fillUserData();
        setupPagination();

    } catch (error) {
        console.error("Erreur lors du chargement du dashboard :", error);
    }
}

// ⚡ Remplissage des champs utilisateur
function fillUserData() {
    if (!window.clientData) return;

    const fillField = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value || "Non renseigné";
    };

    fillField("subscriptionStatus", window.clientData.subscriptionStatus);
    fillField("subscriptionProduct", window.clientData.subscriptionProduct);
    fillField("subscriptionOption", window.clientData.subscriptionOption);
    fillField("siteId", window.clientData.siteId);

    fillField("lastName", window.clientData.lastName);
    fillField("firstName", window.clientData.firstName);
    fillField("birthDate", window.clientData.birthDate ? new Date(window.clientData.birthDate).toLocaleDateString() : "Non renseigné");
    fillField("address", window.clientData.address);
    fillField("phoneNumber", window.clientData.phoneNumber);

    fillField("email", window.clientData.email);
    fillField("isVerified", window.clientData.isVerified ? "Oui" : "Non");
    fillField("paiement", window.clientData.paiement);
    fillField("typePaiement", window.clientData.typePaiement);
    fillField("price", window.clientData.price);
}



// ⚡ Gestion du menu burger
function setupMenu() {
    const menu = document.querySelector("#burger");
    if (menu) {
        menu.addEventListener("click", () => {
            document.querySelector("#sous-nav").classList.toggle("translate");
        });
    }


    document.getElementById("manage-billing").addEventListener("click", async () => {
        try {
            const res = await fetch("/api/create-portal-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include"  // Assure-toi d'inclure les cookies pour l'authentification
            });
    
            const data = await res.json();
            if (res.ok && data.url) {
                window.location.href = data.url;
            } else {
                console.error("Erreur lors de la création de la session Stripe :", data.error || "Erreur inconnue");
                alert("Impossible de rediriger vers le portail de gestion.");
            }
        } catch (error) {
            console.error("Erreur lors de la création de la session Stripe :", error);
            alert("Erreur de communication avec le serveur.");
        }
    });
    
}

// ⚡ Gestion de la pagination
function setupPagination() {
    const pages = document.querySelectorAll(".page");

    pages.forEach(page => {
        page.addEventListener("click", () => {
            pages.forEach(p => document.querySelector(`.${p.id}`).style.display = "none");
            document.querySelector(`.${page.id}`).style.display = "flex";
        });
    });

    // Masquer certaines sections au démarrage
    document.querySelector("#general").style.display = "none";
    document.querySelector("#charging").style.display = "none";
    
    document.querySelector("#logout").addEventListener("click", async () => {
        try {
            const response = await fetch("/api/logout", { credentials: "include" });
            const data = await response.json();
            if (data.message === "Déconnexion réussie") {
                document.querySelector("#divlock").style.display = "flex";
                document.querySelector("#unlock").style.display = "none";
                window.location.href = "/";
            }
        } catch (error) {
            console.error("Erreur de déconnexion :", error);
        }
    });
}



// ⚡ Déconnexion


// ⚡ Initialisation : charger les données et afficher le dashboard
(async () => {
    await fetchUserData();
    await loadDashboard();
})();
