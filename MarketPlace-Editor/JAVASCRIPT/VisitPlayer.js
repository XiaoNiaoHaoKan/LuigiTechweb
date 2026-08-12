let visit = null;
let currentIndex = 0;

// ===============================
// LOAD VISIT
// ===============================
async function loadVisit() {

    console.log("SEARCH RAW:", window.location.search);
    const params = new URLSearchParams(window.location.search);
    const visitId = params.get("id");
    if (!visitId) console.warn("ID non trovato, fallback alla prima visita");


    console.log("ID dall'URL:", visitId);
    console.log("URL completo:", window.location.href);
    
    const visits = await apiGet("/visits");

    if (visitId) {
        visit = visits.find(v => v._id === visitId);
    }

    // fallback SOLO se non trovata
    if (!visit) {
        console.warn("Visita non trovata, uso la prima");
        visit = visits[0];
    }
/*
    if (visitId) {
        visit = visits.find(v => v._id === visitId);
    } else {
        visit = visits[0];
    }
*/
    console.log("VISITA CARICATA:", visit);
    console.log("LUNGHEZZA SEQUENCE:", visit.sequence.length);

    document.getElementById("visitTitle").innerText = visit.title;

    showCurrentItem();
}

// ===============================
// MOSTRA ITEM
// ===============================
function showCurrentItem() {

    if (!visit.sequence[currentIndex]) return;

    const sequenceElement = visit.sequence[currentIndex];

    //prende l’item corrente
    const item = sequenceElement.itemId;

    //mostra dati a schermo
    document.getElementById("itemTitle").innerText = item.title;
    document.getElementById("itemText").innerText = item.text;

    // Se visita è sincronizzata non auto-avanza
    if (visit.synchronized) return;

    const duration = item.duration;

    //se visita non è sincronizzata, autoavanza
    setTimeout(() => {
        nextItem();
    }, duration * 1000);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ===============================
// NEXT ITEM
// ===============================
async function nextItem() {

    currentIndex++;

    if (currentIndex >= visit.sequence.length) {
        alert("Visita terminata");
        return;
    }

    //aggiorni stato sul server (sync tra utenti)
    if (visit.synchronized) {
        await apiPut(`/visits/${visit._id}/state`, {
            currentIndex,
            isPlaying: true
        });
    }

    showCurrentItem();
}

// ===============================
// SYNC POLLING
// ===============================
//ogni 2 secondi
setInterval(async () => {
    if (!visit || !visit.synchronized) return;

    //prende stato aggiornato
    const state = await apiGet(`/visits/${visit._id}/state`);

    currentIndex = state.currentIndex;
    showCurrentItem();

}, 2000);

// ===============================
document
    .getElementById("nextButton")
    .addEventListener("click", nextItem);

// ===============================
loadVisit();