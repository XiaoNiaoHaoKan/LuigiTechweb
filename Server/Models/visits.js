import mongoose from "mongoose";

// Definizione della struttura di una visita nel database.
const visitSchema = new mongoose.Schema({
  title: { type: String, required: true },

  // Visita sincronizzata
  synchronized: { type: Boolean, default: false },
  syncCode: { type: String },

  // Stato controllato dalla docente
  active: { type: Boolean, default: false },
  startedAt: { type: Date },

  currentIndex: { type: Number, default: 0 },
  isPlaying: { type: Boolean, default: false },

  // Sequenza degli item della visita
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
      }
    }
  ],

  // Studenti collegati alla visita sincronizzata
  participants: [
    {
      name: { type: String, required: true },
      joinedAt: { type: Date, default: Date.now },
      lastSeen: { type: Date, default: Date.now }
    }
  ],

  // Richieste fatte dagli studenti durante la visita
  requests: [
    {
      studentName: { type: String, required: true },
      stepIndex: { type: Number, default: 0 },
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
      },
      requestType: {
        type: String,
        enum: ["more-detail", "less-detail", "language", "replay", "other"],
        default: "other"
      },
      requestedDuration: String,
      requestedLanguageLevel: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],

  // Quiz finale
  quizOpen: { type: Boolean, default: false },

  quiz: [
    {
      question: String,
      answers: [String],
      correctIndex: Number
    }
  ],

  quizAnswers: [
    {
      studentName: { type: String, required: true },
      answers: [Number],
      score: Number,
      submittedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

export default mongoose.model("Visit", visitSchema);