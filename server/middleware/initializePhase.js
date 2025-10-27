const phase_model = require('../model/phase');
const phases = require('../config/phases');


async function updateProgress() {
  let current = await phase_model.findOne().sort({ phase: -1 }).exec();

  if (!current) {
    // Start fresh
    current = new phase_model({
      phase: phases[0].phase,
      price: phases[0].price,
      progress: 0,
      lastUpdated: new Date() // track when this phase began
    });
    await current.save();
    console.log("Phase Started")
    return current;
  }

  const now = new Date();
  const currentPhase = phases[current.phase - 1];

  // total duration of this phase in ms (14 days)
  const totalPhaseMs = currentPhase.duration * 24 * 60 * 60 * 1000;

  // elapsed since phase started
  const elapsedMs = now - new Date(current.lastUpdated);

  // compute % progress
  let newProgress = (elapsedMs / totalPhaseMs) * 100;

  if (newProgress >= 100) {
    // move to next phase
    const nextPhase = phases.find(p => p.phase === current.phase + 1);
    if (nextPhase) {
      current = new phase_model({
        phase: nextPhase.phase,
        price: nextPhase.price,
        progress: 0,
        lastUpdated: now
      });
      await current.save();
      console.log(`✅ Phase ${nextPhase.phase} started`);
      return current;
    } else {
      // last phase completed
      current.progress = 100;
      await current.save();
      console.log("🎉 Presale completed");
      return current;
    }
  } else {
    // still in progress
    current.progress = newProgress;
    await current.save();
  }

  return current;
}

// Run every hour
setInterval(async () => {
  try {
    await updateProgress();
  } catch (err) {
    console.error("Error updating progress:", err.message);
  }
}, 60 * 60 * 1000); // 1 hour



module.exports = updateProgress;