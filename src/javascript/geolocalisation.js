
export async function askUserConsent() {
    return new Promise(async (resolve, reject) => {
        try {
            const userConsent = confirm("Nous aimerions utiliser votre adresse IP pour accéder à votre géolocalisation. Acceptez-vous ?");

            if (userConsent) {
                resolve(true);
            } else {
                console.log("L'utilisateur a refusé le consentement");
                resolve(false); // Résoudre la promesse avec false en cas de refus
            }
        } catch (error) {
            console.error('Erreur dans la fonction askUserConsent :', error);
            reject(error);
        }
    });
}

export function getClientIP() {
    const ipFixed = "37.167.101.59"; // géolocalise à l'IUT
    let userConsentIp;
    return askUserConsent()

        .then(userConsent => {
            userConsentIp = userConsent;
            console.log("userConsent : ", userConsent);
            console.log("premier then");
            if (!userConsent) {
                console.log("L'utilisateur a refusé le consentement");
                return Promise.reject("L'utilisateur a refusé le consentement"); // Rejeter la promesse en cas de refus
            }

            // Si le consentement est donné, effectuer la requête
            return fetch('https://ipinfo.io/json');
        })
        .then(response => {
            console.log("deuxieme then");
            if (response.status === 429) {
                console.log("userConsent 429: ", userConsentIp);
                console.error('Trop de requêtes (erreur 429)');
                return Promise.resolve(ipFixed); // Résoudre la promesse avec ipFixed en cas de statut 429
            }

            return response.ip;
        })
        .then(data => {
            console.log("troisieme then");
            if (data) {
                console.log('Client IP Address:', data);
                return data;
            } else {
                return null;
            }
        })
        .catch(error => {
            console.error('Erreur fetching IP address:', error);
            return null;
        });
}


export async function getGeolocation() {
    // coordonnees fixees à Nancy
    let fixedCoordinates = { lon: 6.1611, lat: 48.6828};

    try {
        // Obtenir l'adresse IP du client
        const clientIP = await getClientIP();

        if (clientIP === null) {
            console.error('Erreur dans la récupération de l\'adresse IP. Trop de requêtes (erreur 429).');
            await initMapWithMessage("L\'utilisation de votre adresse IP a refusée. La localisation par défaut est Nancy.")
        }else{
            const url = `http://ip-api.com/json/${clientIP}`;
            const response = await fetch(url);

            if (response.status === 429) {
                console.error('Trop de requêtes (erreur 429). Veuillez réessayer plus tard.');
                // Utiliser ipFixed pour obtenir la localisation
                return getGeolocationIPFixe(clientIP);
            }

            const data = await response.json();

            if (data.lon && data.lat) {
                const coordinates = { lon: data.lon, lat: data.lat };
                console.log('Coordinates geoloc:', coordinates);

                // Vérifier si les coordonnées correspondent à Nancy (exemple)
                const nancyCoordinates = { lon: 6.1836, lat: 48.6925 };
                const distanceThreshold = 1; // 100km autour de Nancy

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
        //ip fixe Nancy
        let fixedCoordinates = { lon: 6.1862, lat: 48.6822 };
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
    //coordonnées nancy place Stan : long : 6.1836 lat 48.6925
    const coordinates = {lon: 6.1836, lat: 48.6925};
    console.log('Coordinates carte initMap():', coordinates);
    if (coordinates) {
        const trafficMap = L.map('trafficMap').setView([coordinates.lat, coordinates.lon],14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(trafficMap);
    }
}

async function initMapWithMessage(message) {
    // Créer un élément de message
    const messageElement = document.createElement('div');
    messageElement.className = 'default-location-message';
    messageElement.textContent = message;

    // Ajouter l'élément au document
    const containerElement = document.getElementById('divGoeloc');
    containerElement.appendChild(messageElement);

    try {
        // Appeler initMap
        await initMap();
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la carte:', error);
    } finally {
    }
}



