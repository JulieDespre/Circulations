
export async function askUserConsent() {
    return new Promise((resolve, reject) => {
        try {
            // Affiche une boîte de dialogue autorisation utilisateur
            const userConsent = confirm("Nous aimerions utiliser votre adresse IP pour accéder à votre géolocalisation. Acceptez-vous ?");

            if (userConsent) {
                // L'utilisateur a donné son consentement
                resolve();
            } else {
                // L'utilisateur a refusé le consentement
                reject("L'utilisateur a refusé le consentement");
            }
        } catch (error) {
            console.error('Erreur dans la fonction askUserConsent :', error);
            reject(error);
        }
    });
}

export async function getClientIP() {
    await askUserConsent();
    let ipFixed = "91.174.180.34";//à changer pour une adresse qui me géolocalise à l'iut
    try {
        await askUserConsent();
        let ipFixed = "91.174.180.34";//à changer pour une adresse qui me géolocalise à l'iut
        const response = await fetch('https://ipinfo.io/json');

        if (response.status === 429) {
            console.error('Trop de requêtes (erreur 429). Veuillez réessayer plus tard.');
            return ipFixed;
        }

        const data = await response.json();
        console.log('Client IP Address:', data.ip);
        return data.ip;
    } catch (error) {
        console.error('Error fetching IP address:', error);
        return ipFixed;
    }
}
/*async function getClientIP() {
    try {
        const response = await fetch('https://ipinfo.io/json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Erreur de récuperation IP:', error);
        return null;
    }
}*/

export async function getGeolocation() {
    let fixedCoordinates = { lon: 6.1862, lat: 48.6822};

    try {
        // Obtenir l'adresse IP du client
        const clientIP = await getClientIP();

        if (clientIP === null) {
            console.error('Erreur dans la récupération de l\'adresse IP. Trop de requêtes (erreur 429).');
            return fixedCoordinates;
        }else{
            const url = `http://ip-api.com/json/${clientIP}`;
            const response = await fetch(url);
            const data = await response.json();


            if (data.lon && data.lat) {
                const coordinates = { lon: data.lon, lat: data.lat };
                console.log('Coordinates:', coordinates);

                // Vérifier si les coordonnées correspondent à Nancy (exemple)
                const nancyCoordinates = { lon: 6.1836, lat: 48.6925 };
                const distanceThreshold = 0.1; // Vous devrez ajuster cela en fonction de votre cas

                if (
                    Math.abs(coordinates.lon - nancyCoordinates.lon) < distanceThreshold &&
                    Math.abs(coordinates.lat - nancyCoordinates.lat) < distanceThreshold
                ) {
                    // Les coordonnées correspondent à Nancy, retourner les coordonnées
                    return coordinates;
                } else {
                    console.error('L\'IP ne correspond pas à Nancy.');
                    return fixedCoordinates;
                }
            } else {
                console.error('Erreur reception coordonnees :', data.message);
                return null;
            }
        }
    } catch (error) {
        console.error('Erreur fetch données données géolocalisation:', error);
        return null;
    }
}

async function getGeolocationIPFixe(ip) {
    try {
        // Utilisation de coordonnées géographiques fixes (par exemple, Paris)
        let fixedCoordinates = { lon: 6.1862, lat: 48.6822};

        // Simuler une pause de 1 seconde (1000 ms) pour illustrer un traitement asynchrone
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('Coordinates:', fixedCoordinates);
        return fixedCoordinates;
    } catch (error) {
        console.error('Error fetching geolocation data:', error);
        return null;
    }

}
async function getGeolocIut() {
    try {
        //coordonnées Iut Charlemagne : 48.6822, 6.1862
        // Utilisation de coordonnées géographiques fixes (par exemple Nancy)
        const fixeCoordinates = {lon: 6.1862, lat: 48.6822};

        //pas asynchrone car coordonnées fixes
        console.log('Coordinates:', fixeCoordinates);
        return fixeCoordinates;
    } catch (error) {
        console.error('Erreur de fetching pour Data geolocation :', error);
        return null;
    }
}
async function initMap() {
    //coordonnées nancy : long : 6.1836 lat 48.6925
    const coordinates = {lon: 6.1836, lat: 48.6925};
    console.log('Coordinates carte:', coordinates);
    if (coordinates) {
        const carte = L.map('carte').setView([coordinates.lat, coordinates.lon],14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(carte);
    }
}
// Exemple d'utilisation

