import mongoose from "mongoose";

// Legge la stessa collezione "museums" popolata da Jack (staff),
// serve solo a esporre al Navigator la mappa del museo e le planimetrie delle sale.
const museumSchema = new mongoose.Schema({
    name: { type: String },
    city: { type: String },
    description: { type: String },
    mapUrl: { type: String, default: "" },

    rooms: [
        {
            name: { type: String },
            description: { type: String, default: "" },
            floorplanUrl: { type: String, default: "" }
        }
    ]
}, { timestamps: true });

export default mongoose.model("Museum", museumSchema);
