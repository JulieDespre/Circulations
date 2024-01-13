import { getGeolocation } from './geolocalisation.js';
const currentDate = new Date();


async function getTrafficData() {
    try {
        const response = await fetch('https://carto.g-ny.org/data/cifs/cifs_waze_v2.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching traffic data:', error);
        throw error;
    }
}

async function initTrafficMap() {
    //coordonnées Iut Charlemagne : 48.6822, 6.1862
    let trafficMap;
    try {
        const userLocation = await getGeolocation();
        console.log('User location initTrafficMap:', userLocation);
        if (userLocation) {
            // carte localisation client
            trafficMap = L.map('trafficMap').setView([userLocation.lat, userLocation.lon], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(trafficMap);
            const redMarker =new L.Icon({
                iconUrl: '/Circulations/assets/logo/etoile.png',
                iconSize: [35, 40],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            // marque emplacement avec l'icône rouge
            L.marker([userLocation.lat, userLocation.lon], { icon: redMarker }).addTo(trafficMap)
                .bindPopup('Votre emplacement').openPopup();
        }

        const trafficData = await getTrafficData();

        if (trafficData && trafficData.incidents && Array.isArray(trafficData.incidents)) {
            trafficData.incidents.forEach(point => {
                if (point.location && point.location.polyline) {
                    const polylineCoordinates = point.location.polyline.split(' ');
                    const latitude = parseFloat(polylineCoordinates[0]);
                    const longitude = parseFloat(polylineCoordinates[1]);

                    if (!isNaN(latitude) && !isNaN(longitude)) {
                        const endDate = new Date(point.endtime);
                        if (!isNaN(endDate) && endDate > currentDate) {
                            // Ajouter un marqueur à la carte pour les problèmes de trafic

                            const trafficIcon = new L.Icon({
                                iconUrl: '/Circulations/assets/logo/traffic-jam.png',
                                iconSize: [25, 41],
                                iconAnchor: [12, 41],
                                popupAnchor: [1, -34],
                                shadowSize: [41, 41]
                            });
                            L.marker([latitude, longitude], { icon: trafficIcon }).addTo(trafficMap)
                                .bindPopup(`Problème de trafic: ${point.type}, Description: ${point.description}, Date de début : ${point.starttime}, Date de fin : ${point.endtime}`);
                        } else {
                            console.warn('Traffic issue has an end date in the past:', point);
                        }
                    } else {
                        console.warn('Coordonnées de TrafficData invalides :', point);
                    }
                } else {
                    console.warn('Données de localisation invalides ou manquantes :', point);
                }
            });
        } else {
            console.error('Format de données de trafic invalides:', trafficData);
        }
    } catch (error) {
        console.error('Erreur initialisation de la carte :', error);
    }
}

// Appel de la fonction principale
initTrafficMap();
