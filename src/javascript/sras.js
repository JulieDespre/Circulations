

function getCSVData() {
    return fetch('https://static.data.gouv.fr/resources/variants-circulants-indicateurs-issus-du-sequencage-emergen/20240110-170034/flash-fra-2024-01-10-18h00.csv')
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

function parseCSV(csvData) {
    return new Promise((resolve, reject) => {
        Papa.parse(csvData, {
            header: true,
            dynamicTyping: true,
            complete: (result) => resolve(result.data),
            error: (error) => reject(error),
        });
    });
}

//creation des data pour le graphs SRAS donuts
function prepareChartData(apiData) {
    const groupedData = {};

    // Parcourez les données de l'API et regroupez-les par date
    apiData.forEach(entry => {
        const date = entry.deb_periode;

        if (!groupedData[date]) {
            groupedData[date] = {
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

        const variant = `variant_${entry.flash_variants}`;
        groupedData[date][variant] += entry.n;
        groupedData[date].total = entry.n_tot;
    });

    return groupedData;
}


// Fonction pour créer un Donut Chart des différents variants
function createDonutChart(data,nbdate) {
    //document.getElementById('sras').innerHTML = "";
    const ctx = document.getElementById('srasVariant').getContext('2d');

    if (window.donutChart) {
        window.donutChart.destroy();
    }

    const date = Object.keys(data)[nbdate];
    const dateData = data[date];
    const total = dateData.total;

    const chartData = {
        labels: ['Variant 1 : alpha', 'Variant 2 : B.1.640', 'Variant 3 : Béta', 'Variant 4 : Delta', 'Variant 5 : Gamma', 'Variant 6 : Omicron', 'Variant 7 : Autres variants'],
        datasets: [{
            data: [
                dateData.variant_1 || 0,
                dateData.variant_2 || 0,
                dateData.variant_3 || 0,
                dateData.variant_4 || 0,
                dateData.variant_5 || 0,
                dateData.variant_6 || 0,
                dateData.variant_7 || 0,
            ],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#FF9800', '#9C27B0', '#795548'],
            hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#FF9800', '#9C27B0', '#795548'],
        }],
    };

    window.donutChart = new Chart(ctx, {
        type: 'doughnut',
        data: chartData,
    });
}

// Fonction pour créer un sélecteur de date
function dateSelector(groupedData) {
    const availableDates = Object.keys(groupedData);
    //liste déroulante avec les dates disponibles
    const dateSelect = document.getElementById('dateSelector');
    availableDates.forEach(date => {
            const option = document.createElement('option');
            option.value = date;
            option.textContent = date;
            dateSelect.appendChild(option);
    });
    // mettre à jour le graphique, nouvelle date est sélectionnée
    dateSelect.addEventListener('change', () => {
        let nbDate = dateSelect.selectedIndex;

        createDonutChart(groupedData,nbDate);
    });
    // Sélectionnez la dernière date par défaut
    createDonutChart(groupedData,0);
}

//trie des datas pour graph prévalence sras
function prepareChartDataPrev(apiData) {
    const chartDataPrev = {};

    //j'aimerais triez les données par date

    apiData.forEach(entry => {
        const date = entry.deb_periode;
        if (!chartDataPrev[date]) {
            chartDataPrev[date] = {date, total: 0};
        }
        chartDataPrev[date].total += entry.n;
    });
    return chartDataPrev;
}

//création du graph prévalence sras
function createLineChart(data) {
    const dates = Object.keys(data);
    const counts = dates.map(date => data[date].total);
    const casSras = document.getElementById('srasCas').getContext('2d');

    window.lineChart = new Chart(casSras, {
        type: 'line',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Nombre de cas',
                data: counts,
                fill: false,
                borderColor: 'grey',
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
//regroupe les données par régions
function prepareChartDataReg(apiData) {
    const groupedDataReg = {};
    console.log(apiData);
    // Parcourez les données de l'API et regroupez-les par date
    apiData.forEach(entry => {
        const reg = entry.reg;

        if (!groupedDataReg[reg]) {
            groupedDataReg[reg] = {
                reg,
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
        groupedDataReg[reg][variantReg] += entry.n;
        //groupedDataReg[date].total = entry.n_tot;
    });

    return groupedDataReg;
}

function prepareChartDataPrevReg(apiData) {
    const chartDataPrev = {};

    //j'aimerais triez les données par date

    apiData.forEach(entry => {
        const reg = entry.reg;
        if (!chartDataPrev[reg]) {
            chartDataPrev[reg] = {reg, total: 0};
        }
        chartDataPrev[reg].total += entry.n;
    });
    return chartDataPrev;
}

//sélecteur par région
function regionSelector(groupedDataReg) {
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
    console.log(groupedDataReg);
    const regions = Object.keys(groupedDataReg);

    console.log(regions);
    const regionSelect = document.getElementById('regionSelector');
    regions.forEach(region => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = `${regionNames[region] || region}`;
        regionSelect.appendChild(option);
    });
    //mettre à jour le graph
    regionSelect.addEventListener('change', () => {
        const selectedRegion = regionSelect.value;
        //const regionData = groupedDataReg.filter(entry => entry.reg === selectedRegion);
        //const groupedData = prepareChartDataReg(regionData);
        //regionSelector(groupedData);
        createDonutChartReg(groupedDataReg,selectedRegion);
    });
/*
    //sélectionner la région liée à l'adresse IP
    try {
        // Obtenir la géolocalisation
        const coordinates = ;

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
    createBarChartReg(initialChartDataPrev);*/
}

function createBarChartReg(data) {
    console.log(data);
    const regions = Object.keys(data);
    const counts = regions.map(reg => data[reg].total);
    const casSras = document.getElementById('srasCasReg').getContext('2d');

    window.lineChart = new Chart(casSras, {
        type: 'line',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Nombre de cas',
                data: counts,
                fill: false,
                borderColor: 'grey',
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
                        text: 'Region',
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

function createDonutChartReg(data,nbreg) {
    //document.getElementById('sras').innerHTML = "";
    const ctx = document.getElementById('srasVariantReg').getContext('2d');

    if (window.donutChart2) {
        window.donutChart2.destroy();
    }

    const reg = Object.keys(data)[nbreg];
    const regData = data[reg];
    if (regData === undefined) {

    }

    const chartData2 = {
        labels: ['Variant 1 : alpha', 'Variant 2 : B.1.640', 'Variant 3 : Béta', 'Variant 4 : Delta', 'Variant 5 : Gamma', 'Variant 6 : Omicron', 'Variant 7 : Autres variants'],
        datasets: [{
            data: [
                regData.variant_1 || 0,
                regData.variant_2 || 0,
                regData.variant_3 || 0,
                regData.variant_4 || 0,
                regData.variant_5 || 0,
                regData.variant_6 || 0,
                regData.variant_7 || 0,
            ],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#FF9800', '#9C27B0', '#795548'],
            hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#FF9800', '#9C27B0', '#795548'],
        }],
    };

    window.donutChart2 = new Chart(ctx, {
        type: 'doughnut',
        data: chartData2,
    });
}

// Utilisation de la fonction
getCSVData()
    .then(csvData => parseCSV(csvData))
    .then(apiData => {
        const groupedData = prepareChartData(apiData);

        // Affichez les données groupées
        console.log('Données groupées APISras :', groupedData);
        dateSelector(groupedData);
        const chartDataPrev = prepareChartDataPrev(apiData);
        createLineChart(chartDataPrev);

    })
    .catch(error => {
        // Gérer les erreurs ici
        console.error('Erreur lors de l\'analyse CSV ou du traitement des données API :', error);
    });

getCSVDataReg()
    .then(csvData => parseCSV(csvData))
    .then(apiData => {

        const groupedDataReg = prepareChartDataReg(apiData);

        // Affichez les données groupées
        console.log('Données groupées APISras :', groupedDataReg);
        regionSelector(groupedDataReg);
        const chartDataPrevReg = prepareChartDataPrevReg(apiData);
        createBarChartReg(chartDataPrevReg);

    })
    .catch(error => {
        // Gérer les erreurs ici
        console.error('Erreur lors de l\'analyse CSV ou du traitement des données API :', error);
    });