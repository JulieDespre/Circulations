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


// Fonction pour créer un Donut Chart
function createDonutChart(data,nbdate) {
    //document.getElementById('sras').innerHTML = "";
    const ctx = document.getElementById('sras').getContext('2d');

    if (window.donutChart) {
        window.donutChart.destroy();
    }

    const date = Object.keys(data)[nbdate];
    const dateData = data[date];
    const total = dateData.total;

    const chartData = {
        labels: ['Variant 1 : alpha', 'Variant 2', 'Variant 3', 'Variant 4', 'Variant 5', 'Variant 6', 'Variant 7'],
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


// Utilisation de la fonction
getCSVData()
    .then(csvData => parseCSV(csvData))
    .then(apiData => {
        const groupedData = prepareChartData(apiData);

        // Affichez les données groupées
        console.log('Données groupées APISras :', groupedData);
        dateSelector(groupedData);

    })
    .catch(error => {
        // Gérer les erreurs ici
        console.error('Erreur lors de l\'analyse CSV ou du traitement des données API :', error);
    });