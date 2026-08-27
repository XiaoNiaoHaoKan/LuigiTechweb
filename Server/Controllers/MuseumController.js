import Museum from "../Models/museum.js";

// ===============================
// GET MUSEO PER ID (sola lettura, usato dal Navigator)
// ===============================
export async function getMuseumById(req, res) {
    try {
        const museum = await Museum.findById(req.params.id);

        if (!museum) {
            return res.status(404).json({ message: "Museo non trovato" });
        }

        res.json(museum);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
