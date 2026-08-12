// ===============================
// CARICA E MOSTRA LE VISITE
// ===============================

async function loadVisits() {

    const visits = await apiGet("/visits");

    const container = document.getElementById("visitsList");
    container.innerHTML = "";

    visits.forEach((visit) => {

        const div = document.createElement("div");
        div.classList.add("card");

        div.innerHTML = `
            <h3>${visit.title}</h3>

            <p><strong>Tipo:</strong> ${visit.synchronized ? "Sincronizzata" : "Libera"}</p>

            <button onclick="startVisit('${visit._id}')">
                Inizia visita
            </button>
        `;

        container.appendChild(div);
    });
}


// ===============================
// AVVIA VISITA
// ===============================
/*
function startVisit(visitId) {

    console.log("VISITA SCELTA:", visitId);

     if (!visitId) {
    console.error("ID mancante nell'URL!");
}
    window.location.href = `http://localhost:5000/VisitPlayer.html?id=${visitId}`;

   
}

*/

function startVisit(visitId) {
    if (!visitId) {
        console.error("ID mancante!");
        return;
    }

    // Prendi URL corrente e aggiungi .html?id=...
    let url = window.location.origin + "/VisitPlayer.html?id=" + visitId;

    // Mostra cosa succede
    console.log("REDIRECT A:", url);
    alert("Redirect a: " + url);

    // Redirect reale
    window.location.href = url;
}
// ===============================
// AVVIO
// ===============================

loadVisits();