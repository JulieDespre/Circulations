
async function getClientIP() {
    try {
        const response = await fetch('https://ipinfo.io/json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Error fetching IP address:', error);
    }
}

// Utilisation de la fonction pour obtenir l'adresse IP
getClientIP().then(ip => {
    console.log('Client IP Address:', ip);
    // Utilisez cette information pour effectuer d'autres opérations
});
