import { getGeolocation} from './geolocalisation.js';
function getCSVDataReg() {
    return fetch('https://www.data.gouv.fr/fr/datasets/r/c68e73c2-5045-4ee2-ac50-bd1c39ff3175')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur de la requète HTTP : ${response.status}`);
            }
            return response.text();
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des données CSV :', error);
            throw error;
        });
}

function parseCSVReg(csvData) {
    return new Promise((resolve, reject) => {
        Papa.parse(csvData, {
            header: true,
            dynamicTyping: true,
            complete: (result) => resolve(result.data),
            error: (error) => reject(error),
        });
    });
}


function prepareChartDataReg(apiData) {
    const groupedDataReg = {};

    // Parcourez les données de l'API et regroupez-les par date
    apiData.forEach(entry => {
        const date = entry.deb_periode;

        if (!groupedDataReg[date]) {
            groupedDataReg[date] = {
                date,
                variant_1: 0,
                variant_2: 0,
                variant_3: 0,
                variant_4: 0,
                variant_5: 0,
                variant_6: 0,
                variant_7: 0,
            };
        }

        const variantReg = `variant_${entry.flash_variants}`;
        groupedDataReg[date][variantReg] += entry.n;
        groupedDataReg[date].total = entry.n_tot;
    });

    return groupedDataReg;
}


// Fonction pour créer un Donut Chart des différents variants
function createDonutChartReg(data,nbdate) {
    //document.getElementById('sras').innerHTML = "";
    const ctxReg = document.getElementById('srasVariantReg').getContext('2d');

    if (window.donutChartReg) {
        window.donutChartReg.destroy();
    }

    const dateReg = Object.keys(data)[nbdate];
    const dateDataReg = data[dateReg];
    const totalReg = dateDataReg.total;

    const chartData = {
        labels: ['Variant 1 : alpha', 'Variant 2 : B.1.640', 'Variant 3 : Béta', 'Variant 4 : Delta', 'Variant 5 : Gamma', 'Variant 6 : Omicron', 'Variant 7 : Autres variants'],
        datasets: [{
            data: [
                dateDataReg.variant_1 || 0,
                dateDataReg.variant_2 || 0,
                dateDataReg.variant_3 || 0,
                dateDataReg.variant_4 || 0,
                dateDataReg.variant_5 || 0,
                dateDataReg.variant_6 || 0,
                dateDataReg.variant_7 || 0,
            ],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#FF9800', '#9C27B0', '#795548'],
            hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#FF9800', '#9C27B0', '#795548'],
        }],
    };

    window.donutChartReg = new Chart(ctxReg, {
        type: 'doughnut',
        data: chartData,
    });
}



//selection et créer les groupes de données
async function regionSelector(apiData) {
    const regions = [...new Set(apiData.map(entry => entry.reg))];
    const regionSelect = document.querySelector('.regionSelector');
    regions.forEach(region => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = `${regionNames[region] || region}`;
        regionSelect.appendChild(option);
    });

    regionSelect.addEventListener('change', () => {
        const selectedRegion = regionSelect.value;
        const regionData = apiData.filter(entry => entry.reg === selectedRegion);
        const groupedData = prepareChartDataReg(regionData);
        dateSelectorReg(groupedData);
        const chartDataPrev = prepareChartDataPrev(regionData);
        createLineChart(chartDataPrev);
    });

    //sélectionner la région liée à l'adresse IP
    try {
        // Obtenir la géolocalisation
        const coordinates = await getGeolocation();

        if (coordinates) {
            console.log('Coordonnées obtenues avec succès :', coordinates);


        } else {

        }
    } catch (error) {
        console.error('Erreur lors de l\'utilisation des fonctions de géolocalisation :', error);
    }


    // Sélectionnez la première région par défaut
    const initialRegion = regions[13];
    const initialRegionData = apiData.filter(entry => entry.reg === initialRegion);
    const initialGroupedData = prepareChartDataReg(initialRegionData);
    dateSelectorReg(initialGroupedData);
    const initialChartDataPrev = prepareChartDataPrevReg(initialRegionData);
    createBarChartReg(initialChartDataPrev);
}
const regionNames = {
    '1': 'Guadeloupe',
    '2': 'Martinique',
    '3': 'Guyane',
    '4': 'La Réunion',
    '5': 'Saint-Pierre-et-Miquelon',
    '6': 'Mayotte',
    '7': 'Saint-Barthélemy',
    '8': 'Saint-Martin',
    '11': 'Ile-de-France',
    '24': 'Centre-Val de Loire',
    '27': 'Bourgogne-Franche-Comté',
    '28': 'Normandie',
    '32': 'Hauts-de-France',
    '44': 'Grand Est',
    '52': 'Pays de la Loire',
    '53': 'Bretagne',
    '75': 'Nouvelle-Aquitaine',
    '76': 'Occitanie',
    '84': 'Auvergne-Rhône-Alpes',
    '93': 'Provence-Alpes-Côte d’Azur',
    '94': 'Corse',
};

//creation graph prévalence sras
function prepareChartDataPrevReg(apiData) {
    const chartDataPrevReg = {};

    apiData.forEach(entry => {
        const date = entry.deb_periode;
        if (!chartDataPrevReg[date]) {
            chartDataPrevReg[date] = {date, total: 0};
        }
        chartDataPrevReg[date].total += entry.n;
    });
    return chartDataPrevReg;
}

function createBarChartReg(data) {
    const datesReg = Object.keys(data);
    const countsReg = datesReg.map(date => data[date].total);
    const casSrasReg = document.getElementById('srasCasReg').getContext('2d');

    window.barChartReg = new Chart(casSrasReg, {
        type: 'bar',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Nombre de cas',
                data: countsReg,
                fill: false,
                borderColor: 'mediumspringgreen',
                borderWidth: 2,
                tension: 0.1,
            }],
        },
        options: {
            scales: {
                x: {
                    //type: 'string',
                    title: {
                        display: true,
                        text: 'Date',
                    },
                },
                y: {
                    title: {
                        beginAtZero: true,
                        display: true,
                        text: 'Nombres de cas',
                    },
                },
            },
        },
    });
}


// Utilisation de la fonction
getCSVDataReg()
    .then(csvData => parseCSVReg(csvData))
    .then(apiData => {
        regionSelector(apiData);
        const groupedDataReg = prepareChartDataReg(apiData);

        // Affichez les données groupées
        console.log('Données groupées APISras :', groupedDataReg);
        dateSelectorReg(groupedDataReg);
        const chartDataPrevReg = prepareChartDataPrevReg(apiData);
        createBarChartReg(chartDataPrevReg);

    })
    .catch(error => {
        // Gérer les erreurs ici
        console.error('Erreur lors de l\'analyse CSV ou du traitement des données API :', error);
    });