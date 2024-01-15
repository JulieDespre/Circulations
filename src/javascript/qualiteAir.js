getAir();

/**
 * Récupère les données à propos de la qualité de l'air pour aujourd'hui et affiche une icone y correspondant.
 * @returns {Promise<void>}
 */
async function getAir() {
    var airQualityIcon = document.getElementById('airqualityicon');
    var today = new Date();
    var formattedDate = today.toISOString().split('T')[0];
    console.log(formattedDate)
    let url = "https://services3.arcgis.com/Is0UwT37raQYl9Jj/ArcGIS/rest/services/ind_grandest/FeatureServer/0/" +
        "query?where=lib_zone%3D%27Nancy%27+AND+date_ech%3D%27" + formattedDate + "%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&relationParam=&returnGeodetic=false&outFields=code_qual%2C+lib_qual&returnGeometry=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&defaultSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=json&token=";
    try {
        const response = await fetch(url);
        const data = await response.json();

        // Mappage des valeurs de code_qual aux chemins d'image correspondants
        const imagePathMapping = {
            1: "assets/logo/ok.png",
            2: "assets/logo/neutral.png",
            3: "assets/logo/notOk.png",
            4: "assets/logo/notOk.png",
            // Ajoutez d'autres correspondances au besoin
        };

        // Utilisation du mappage pour obtenir le chemin d'image approprié
        airQualityIcon.src = imagePathMapping[data.features[0].attributes.code_qual] || "assets/logo/default.png";
    } catch (exception) {
        console.log(exception);
    }
}
