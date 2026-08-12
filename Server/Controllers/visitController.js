// Importiamo il modello Visit per poter interagire con MongoDB
import Visit from "../Models/visits.js";

//Contiene la logica operativa sulle visite.

// ===============================
// CREA NUOVA VISITA (salva dati su mongoDB)
// ===============================
export async function createVisit(req, res) {

    try {
        // Creiamo una nuova visita usando i dati ricevuti dal frontend
        const newVisit = await Visit.create(req.body);

        // Restituiamo la visita appena creata come risposta JSON
        res.json(newVisit);

    } catch (error) {
        // In caso di errore inviamo codice 500 e messaggio
        res.status(500).json({ error: error.message });
    }
}

// ===============================
// OTTIENI TUTTE LE VISITE
// ===============================
export async function getVisits(req, res) {

    try {

        // Recuperiamo le visite e popoliamo gli item
        const visits = await Visit.find()
            //populate dice a Mongo: Quando trovi itemId, recupera anche il documento Item collegato.
            .populate("sequence.itemId");

        res.json(visits);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


// ===============================
// ELIMINA VISITA
// ===============================
export async function deleteVisit(req, res) {

    try {
        // Eliminiamo la visita usando l'id passato nell'URL
        await Visit.findByIdAndDelete(req.params.id);

        // Conferma eliminazione
        res.json({ message: "Visit deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function updateVisit(req, res) {
    const visit = await Visit.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );
    res.json(visit);
}

export async function getVisitState(req, res) {
    //legge lo stato della visita
    const visit = await Visit.findById(req.params.id);

    //ritorna solo lo stato (NON tutta la visita)
    res.json({
        currentIndex: visit.currentIndex,
        isPlaying: visit.isPlaying
    });
}

export async function updateVisitState(req, res) {
    //riceve stato dal frontend
    const { currentIndex, isPlaying } = req.body;

    //salva lo stato nel DB
    const visit = await Visit.findByIdAndUpdate(
        req.params.id,
        { currentIndex, isPlaying },
        { new: true }
    );

    res.json(visit);
}