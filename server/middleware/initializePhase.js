const phase_model = require('../model/phase');

// --- CONFIG ---
const phases = [
  { phase: 1, price: 0.01, duration: 10 }, // 10 days
  { phase: 2, price: 0.02, duration: 10 },
  { phase: 3, price: 0.05, duration: 10 },
  { phase: 4, price: 0.07, duration: 10 }, // 10 days
  { phase: 5, price: 0.09, duration: 10 },
  { phase: 6, price: 0.1, duration: 10 },
  { phase: 7, price: 0.3, duration: 10 }, // 10 days
  { phase: 8, price: 0.5, duration: 10 },
  { phase: 9, price: 0.7, duration: 10 }
];

 async function updateProgress(){
   
    let current  = await phase_model.findOne().sort({phase:-1}).exec();
    if(!current){
         // start fresh
        current = new phase_model({
        phase: phases[0].phase,
        price: phases[0].price,
        progress: 0,
        lastUpdated: new Date()
        });
        await current.save();
        return current;

        }

        const now = new Date();
        const secondsPassed = Math.floor((now-current.lastUpdated)/1000); //inseconds
        if(secondsPassed >5){
             // progress interval
            const stepPercent = 100 / (phases[current.phase - 1].duration * (24 * 60 * 60 / 5));
            
             let newProgress = current.progress + stepPercent * Math.floor(secondsPassed / 5);

            // let newProgress = current.progress + (daysPassed * (100 / phases[current.phase - 1].duration));
              
             if(newProgress >=100){
                const nextPhase = phases.find(p=> p.phase === current.phase +1);
                if(nextPhase){
                     current = new phase_model({
                        phase: nextPhase.phase,
                        price: nextPhase.price,
                        progress: 0,
                        lastUpdated: now
                     });
                     await current.save();
                      console.log(`Phase ${nextPhase.phase} started ✅`);
                    return current;
                }else{
                        // Last phase stays at 100%
                        current.progress = 100;
                        current.lastUpdated = now;
                        await current.save();
                         console.log("Presale completed 🎉");
                        return current;
                }
             }else{
                   current.progress = newProgress;
                    current.lastUpdated = now;
                    await current.save();
             }
        }

         return current;
}

setInterval(async () => {
  try {
    await updateProgress();
  } catch (err) {
    console.error("Error updating progress:", err.message);
  }
},  60 * 60 * 1000);

module.exports = updateProgress;