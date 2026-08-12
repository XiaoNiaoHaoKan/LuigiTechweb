import mongoose from "mongoose";

//Definizione della struttura di una visita nel database.
const visitSchema = new mongoose.Schema({
    
    title: { type: String, required: true },

    synchronized: { type: Boolean, default: false },
    syncCode: { type: String },

    currentIndex: { type: Number, default: 0 },
            isPlaying: { type: Boolean, default: false },

    sequence: [
        {
            itemId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Item",
                required: true
            },
            order: {
                type: Number,
                required: true
            },
        }
    ],

    quiz: [
        {
            question: String,
            answers: [String],
            correctIndex: Number
        }
    ]
}, { timestamps: true });

export default mongoose.model("Visit", visitSchema);