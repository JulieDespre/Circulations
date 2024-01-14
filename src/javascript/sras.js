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

function prepareChartData(csvData) {
    let labels = csvData.map(entry => entry.flash_variants);
    let values = csvData.map(entry => entry.n);

    return { labels, values };
}

// Utilisation de la fonction
if (typeof Papa === 'undefined') {
    console.error('PapaParse is not defined. Make sure the library is loaded.');
} else {
    getCSVData()
        .then(csvData => parseCSV(csvData))
        .then(parsedData => {
            const chartData = prepareChartData(parsedData);
            createDonutChart(chartData);
        })
        .catch(error => {
            // Gérer les erreurs ici
            console.error('Erreur lors de l\'analyse CSV :', error);
        });
}

function createDonutChart(data) {
    const ctx = document.getElementById('sras').getContext('2d');

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: getRandomColors(data.labels.length),
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                display:false,
                position: 'right',
            },
            title: {
                display: true,
                text: 'Distribution des variants',
            },
            tooltips: {
                callbacks: {
                    label: (tooltipItem, data) => {
                        const dataset = data.datasets[tooltipItem.datasetIndex];
                        const total = dataset.data.reduce((sum, value) => sum + value, 0);
                        const value = dataset.data[tooltipItem.index];
                        const percentage = ((value / total) * 100).toFixed(2);
                        return `${data.labels[tooltipItem.index]}: ${percentage}%`;
                    },
                },
            },
        },
    });
}

function getRandomColors(numColors) {
    // Génère des couleurs aléatoires pour le graphique
    const colors = [];
    for (let i = 0; i < numColors; i++) {
        colors.push(`#${Math.floor(Math.random() * 16777215).toString(16)}`);
    }
    return colors;
}