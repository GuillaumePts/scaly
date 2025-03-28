if (window.clientData) {
    console.log("Utilisateur connecté :", window.clientData);
    
} else {
    // Si la page a été rechargée, récupérer les données depuis le backend via le token
    fetch("/me", { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            if (data.user) {
                window.clientData = data.user;
                console.log("Utilisateur récupéré :", data.user);
            } else {
                console.log('pute'); // Redirige vers la connexion si non authentifié
            }
        })
        .catch(() => window.location.href = "/login");
}
