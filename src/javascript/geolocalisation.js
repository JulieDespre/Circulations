async function getClientIP() {
    try {
        const response = await fetch('https://ipinfo.io/json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Erreur de récuperation IP:', error);
        return null;
    }
}

/*async function getGeolocation() {
    try {
        const clientIP = await getClientIP();

        //résupérer les coordonnées depuis l'ip client
        if (clientIP) {
            const url = `http://ip-api.com/json/${clientIP}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.lon && data.lat) {
                const coordinates = { lon: data.lon, lat: data.lat };
                console.log('Coordinates:', coordinates);
                return coordinates;
            } else {
                console.error('Erreur reception coordonnees :', data.message);
                return null;
            }
        } else {
            console.error('Erreur reception IP client.');
            return null;
        }
    } catch (error) {
        console.error('Erreur fetch données données géolocalisation:', error);
        return null;
    }
}*/
async function getGeolocation(ip) {
    try {
        // Utilisation de coordonnées géographiques fixes (par exemple, Paris)
        const fixedCoordinates = { lon: 6.1862, lat: 48.6822 };

        // Simuler une pause de 1 seconde (1000 ms) pour illustrer un traitement asynchrone
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('Coordinates:', fixedCoordinates);
        return fixedCoordinates;
    } catch (error) {
        console.error('Error fetching geolocation data:', error);
        return null;
    }
}
async function initMap() {
    //const userIp = '37.174.216.209';
    const coordinates = await getGeolocation();
    console.log('Coordinates carte:', coordinates);
    if (coordinates) {
        const carte = L.map('carte').setView([coordinates.lat, coordinates.lon],17);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(carte);

        const marker = L.marker([coordinates.lat, coordinates.lon]).addTo(carte);
        marker.bindPopup('vous êtes ici').openPopup();
    }
}
// Exemple d'utilisation
getGeolocation();
initMap();
