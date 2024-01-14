// Fonction pour demander le consentement de l'utilisateur
export async function askUserConsent() {
    try {
        // Affiche une boîte de dialogue autorisation utilisateur
        const userConsent = confirm("Nous aimerions utiliser votre adresse IP pour accéder à votre géolocalisation. Acceptez-vous ?");

        if (userConsent) {
            // L'utilisateur a donné son consentement, obtenir les coordonnées de géolocalisation
            return await getClientIP();
        } else {
            // L'utilisateur a refusé le consentement, afficher un message d'excuse et obtenir les coordonnées fixes de l'IUT
            alert("Désolé, pour utiliser nos services, vous devez partager votre adresse IP.");
            return await initMap();
        }
    } catch (error) {
        console.error('Erreur dans la fonction askUserConsent :', error);
        return null;
    }
}

export async function getClientIP() {
    askUserConsent();
    try {
        const response = await fetch('https://ipinfo.io/json');
        const data = await response.json();
        console.log('Client IP Address:', data.ip);
        return data.ip;
    } catch (error) {
        console.error('Error fetching IP address:', error);
    }
}

// Utilisation de la fonction pour obtenir l'adresse IP
getClientIP().then(ip => {
    console.log('Client IP Address:', ip);
}).catch(error => {
    console.error('Erreur dans la récupération de l\'adresse IP:', error);
});

