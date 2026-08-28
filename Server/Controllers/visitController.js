// Importiamo il modello Visit per poter interagire con MongoDB
import Visit from "../Models/visits.js";

// Contiene la logica operativa sulle visite.

// ===============================
// CREA NUOVA VISITA
// ===============================
export async function createVisit(req, res) {
  try {
    const newVisit = await Visit.create(req.body);
    res.json(newVisit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ===============================
// OTTIENI TUTTE LE VISITE
// ===============================
export async function getVisits(req, res) {
  try {
    const visits = await Visit.find()
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
    await Visit.findByIdAndDelete(req.params.id);
    res.json({ message: "Visit deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ===============================
// MODIFICA VISITA
// ===============================
export async function updateVisit(req, res) {
  try {
    const visit = await Visit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!visit) {
      return res.status(404).json({ message: "Visita non trovata" });
    }

    res.json(visit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ===============================
// OTTIENI STATO VISITA
// ===============================
export async function getVisitState(req, res) {
  try {
    const visit = await Visit.findById(req.params.id);

    if (!visit) {
      return res.status(404).json({ message: "Visita non trovata" });
    }

    res.json({
      currentIndex: visit.currentIndex,
      isPlaying: visit.isPlaying
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ===============================
// AGGIORNA STATO VISITA
// ===============================
export async function updateVisitState(req, res) {
  try {
    const { currentIndex, isPlaying } = req.body;

    const visit = await Visit.findByIdAndUpdate(
      req.params.id,
      { currentIndex, isPlaying },
      { new: true }
    );

    if (!visit) {
      return res.status(404).json({ message: "Visita non trovata" });
    }

    res.json(visit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// =====================================================
// FUNZIONI DI SUPPORTO PER VISITE SINCRONIZZATE
// =====================================================

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function findSyncVisitByCode(code) {
  const normalizedCode = String(code ?? "").trim();

  return Visit.findOne({
    synchronized: true,
    syncCode: {
      $regex: `^${escapeRegex(normalizedCode)}$`,
      $options: "i"
    }
  }).populate("sequence.itemId");
}

// =====================================================
// OTTIENI VISITA SINCRONIZZATA DA CODICE
// Esempio: GET /api/visits/sync/Fenice%20rossa
// =====================================================
export async function getSyncVisit(req, res) {
  try {
    const visit = await findSyncVisitByCode(req.params.code);

    if (!visit) {
      return res.status(404).json({
        message: "Visita sincronizzata non trovata"
      });
    }

    res.json(visit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// =====================================================
// ATTIVA VISITA SINCRONIZZATA
// La docente avvia la visita
// =====================================================
export async function activateSyncVisit(req, res) {
  try {
    const visit = await findSyncVisitByCode(req.params.code);

    if (!visit) {
      return res.status(404).json({
        message: "Visita sincronizzata non trovata"
      });
    }

    visit.active = true;
    visit.startedAt = new Date();
    visit.currentIndex = 0;
    visit.isPlaying = false;
    visit.quizOpen = false;
    visit.quizStarted = false;

    await visit.save();

    const updatedVisit = await findSyncVisitByCode(req.params.code);
    res.json(updatedVisit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// =====================================================
// STUDENTE SI COLLEGA ALLA VISITA
// =====================================================
export async function joinSyncVisit(req, res) {
  try {
    const { studentName } = req.body;

    if (!studentName || !String(studentName).trim()) {
      return res.status(400).json({
        message: "Nome studente obbligatorio"
      });
    }

    const visit = await findSyncVisitByCode(req.params.code);

    if (!visit) {
      return res.status(404).json({
        message: "Visita sincronizzata non trovata"
      });
    }

    if (!visit.active) {
      return res.status(400).json({
        message: "La visita non è ancora attiva"
      });
    }

    const cleanName = String(studentName).trim();

    const existingParticipant = visit.participants.find((participant) => {
      return participant.name.toLowerCase() === cleanName.toLowerCase();
    });

    if (existingParticipant) {
      existingParticipant.lastSeen = new Date();
    } else {
      visit.participants.push({
        name: cleanName,
        joinedAt: new Date(),
        lastSeen: new Date()
      });
    }

    const existingStudent = visit.students.find((student) => {
      return student.name.toLowerCase() === cleanName.toLowerCase();
    });

    if (!existingStudent) {
      visit.students.push({ name: cleanName, joinedAt: new Date() });
    }

    await visit.save();

    const updatedVisit = await findSyncVisitByCode(req.params.code);
    res.json(updatedVisit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// =====================================================
// DOCENTE AGGIORNA STATO SINCRONIZZATO
// currentIndex = tappa corrente
// isPlaying = audio avviato / fermo
// =====================================================
export async function updateSyncState(req, res) {
  try {
    const { currentIndex, isPlaying } = req.body;

    const visit = await findSyncVisitByCode(req.params.code);

    if (!visit) {
      return res.status(404).json({
        message: "Visita sincronizzata non trovata"
      });
    }

    if (typeof currentIndex === "number") {
      visit.currentIndex = currentIndex;
    }

    if (typeof isPlaying === "boolean") {
      visit.isPlaying = isPlaying;
    }

    await visit.save();

    const updatedVisit = await findSyncVisitByCode(req.params.code);
    res.json(updatedVisit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// =====================================================
// STUDENTE INVIA UNA RICHIESTA
// Esempi: più dettagli, linguaggio diverso, riascolta
// =====================================================
export async function createSyncRequest(req, res) {
  try {
    const {
      studentName,
      stepIndex,
      itemId,
      requestType,
      requestedDuration,
      requestedLanguageLevel
    } = req.body;

    if (!studentName || !String(studentName).trim()) {
      return res.status(400).json({
        message: "Nome studente obbligatorio"
      });
    }

    const visit = await findSyncVisitByCode(req.params.code);

    if (!visit) {
      return res.status(404).json({
        message: "Visita sincronizzata non trovata"
      });
    }

    visit.requests.push({
      studentName: String(studentName).trim(),
      stepIndex: Number(stepIndex ?? visit.currentIndex ?? 0),
      itemId,
      requestType: requestType ?? "other",
      requestedDuration,
      requestedLanguageLevel,
      createdAt: new Date()
    });
    visit.questions.push({
      text: `${String(studentName).trim()}: ${requestType ?? "other"}`,
      answered: false
    });

    await visit.save();

    const updatedVisit = await findSyncVisitByCode(req.params.code);
    res.json(updatedVisit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// =====================================================
// DOCENTE APRE O CHIUDE IL QUIZ
// =====================================================
export async function setSyncQuizOpen(req, res) {
  try {
    const { quizOpen } = req.body;

    const visit = await findSyncVisitByCode(req.params.code);

    if (!visit) {
      return res.status(404).json({
        message: "Visita sincronizzata non trovata"
      });
    }

    if (typeof quizOpen !== "boolean") {
      return res.status(400).json({ message: "quizOpen deve essere booleano" });
    }

    visit.quizOpen = quizOpen;
    visit.quizStarted = quizOpen;

    await visit.save();

    const updatedVisit = await findSyncVisitByCode(req.params.code);
    res.json(updatedVisit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// =====================================================
// STUDENTE INVIA RISPOSTE AL QUIZ
// =====================================================
export async function submitSyncQuizAnswer(req, res) {
  try {
    const { studentName, answers } = req.body;

    if (!studentName || !String(studentName).trim()) {
      return res.status(400).json({
        message: "Nome studente obbligatorio"
      });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        message: "Risposte non valide"
      });
    }

    const visit = await findSyncVisitByCode(req.params.code);

    if (!visit) {
      return res.status(404).json({
        message: "Visita sincronizzata non trovata"
      });
    }

    const score = answers.reduce((total, answer, index) => {
      const question = visit.quiz[index];

      if (!question) {
        return total;
      }

      return Number(answer) === Number(question.correctIndex)
        ? total + 1
        : total;
    }, 0);

    const cleanName = String(studentName).trim();

    visit.quizAnswers = visit.quizAnswers.filter((quizAnswer) => {
      return quizAnswer.studentName.toLowerCase() !== cleanName.toLowerCase();
    });

    visit.quizAnswers.push({
      studentName: cleanName,
      answers,
      score,
      submittedAt: new Date()
    });
    visit.quizResults = visit.quizResults.filter((result) => {
      return result.studentName.toLowerCase() !== cleanName.toLowerCase();
    });
    visit.quizResults.push({
      studentName: cleanName,
      answers,
      score,
      completedAt: new Date()
    });

    await visit.save();

    res.json({
      studentName: cleanName,
      score,
      total: visit.quiz.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}