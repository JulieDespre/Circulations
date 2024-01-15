
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

//creation graph prévalence sras
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
                borderColor: '#2196F3',
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