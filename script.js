let audioCtx;
let currentOscillator = null;
let currentGainNode = null;

let isPlaying = false;
let isOver = false;

let refFreq = 1000;
let duration = 0.75; // in s

let maxDB = 80;
let refDB = 60;
let refGain = dBToGain(refDB);

// startvalues
let halfDB = refDB;
let doubleDB = refDB;







function renderResults() {

    document.getElementById("resultCont").classList.remove("d-none");

    let table = document.getElementById("resultTable");

    document.getElementById(`resultTable`).innerHTML = `
    <tr>
        <th>Halb so laut</th>
        <th>Referenz</th>
        <th>Doppelt so laut</th>
    </tr>
    <tr>
        <td>${halfDB - refDB}</td>
        <td>${refDB - refDB}</td>
        <td>${doubleDB - refDB}</td>
    </tr>
    `;


}

function disableButtons() {
    document.getElementById('refButton').disabled = true;
    document.getElementById('vergleichsButton1').disabled = true;
    document.getElementById('plusButton1').disabled = true;
    document.getElementById('plusPlusButton1').disabled = true;
    document.getElementById('minusButton1').disabled = true;
    document.getElementById('minusMinusButton1').disabled = true;
    document.getElementById('vergleichsButton2').disabled = true;
    document.getElementById('plusButton2').disabled = true;
    document.getElementById('plusPlusButton2').disabled = true;
    document.getElementById('minusButton2').disabled = true;
    document.getElementById('minusMinusButton2').disabled = true;
    document.getElementById('fertigButton').disabled = true;
}

function enableButtons() {
    document.getElementById('refButton').disabled = false;
    document.getElementById('vergleichsButton1').disabled = false;
    document.getElementById('plusButton1').disabled = false;
    document.getElementById('plusPlusButton1').disabled = false;
    document.getElementById('minusButton1').disabled = false;
    document.getElementById('minusMinusButton1').disabled = false;
    document.getElementById('vergleichsButton2').disabled = false;
    document.getElementById('plusButton2').disabled = false;
    document.getElementById('plusPlusButton2').disabled = false;
    document.getElementById('minusButton2').disabled = false;
    document.getElementById('minusMinusButton2').disabled = false;
    document.getElementById('fertigButton').disabled = false;
}

function dBToGain(db) {
    const gain = Math.pow(10, (db - maxDB) / 20);
    return Math.min(Math.max(gain, 0), 1); // clamp gain between 0 and 1
}

function gainToDB(gain) {
    return 20 * Math.log10(gain) + maxDB
}


function plusButton(index) {
    if (index == 1) {
        halfDB++;
        playSound(refFreq, dBToGain(halfDB), duration);
    }
    if (index == 2) {
        doubleDB++;
        playSound(refFreq, dBToGain(doubleDB), duration);
    }
}

function plusPlusButton(index) {
    if (index == 1) {
        halfDB += 2;
        playSound(refFreq, dBToGain(halfDB), duration);
    }
    if (index == 2) {
        doubleDB += 2;
        playSound(refFreq, dBToGain(doubleDB), duration);
    }
}

function minusButton(index) {
    if (index == 1) {
        halfDB--;
        playSound(refFreq, dBToGain(halfDB), duration);
    }
    if (index == 2) {
        doubleDB--;
        playSound(refFreq, dBToGain(doubleDB), duration);
    }
}

function minusMinusButton(index) {
    if (index == 1) {
        halfDB -= 2;
        playSound(refFreq, dBToGain(halfDB), duration);
    }
    if (index == 2) {
        doubleDB -= 2;
        playSound(refFreq, dBToGain(doubleDB), duration);
    }
}


function playSound(freq, gain, dur) {

    console.log(gainToDB(gain))

    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    disableButtons();

    // Vorherigen Ton stoppen, falls vorhanden
    if (currentOscillator) {
        try {
            currentOscillator.stop();
            currentOscillator.disconnect();
        } catch (e) {
            console.warn("Oscillator already stopped");
        }
    }
    if (currentGainNode) {
        try {
            currentGainNode.disconnect();
        } catch (e) {
            console.warn("Gain node already disconnected");
        }
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    const now = audioCtx.currentTime;
    const fadeTime = 0.05; // 100 ms

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, now);

    // Gain: Fade-In & Fade-Out
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(gain, now + fadeTime); // Fade-in
    gainNode.gain.setValueAtTime(gain, now + dur - fadeTime);
    gainNode.gain.linearRampToValueAtTime(0, now + dur); // Fade-out

    oscillator.connect(gainNode).connect(audioCtx.destination);
    oscillator.start(now);
    oscillator.stop(now + dur);

    // ⬅️ wichtig: speichern für zukünftiges Stoppen
    currentOscillator = oscillator;
    currentGainNode = gainNode;

    // Cleanup
    setTimeout(() => {
        try {
            oscillator.disconnect();
            gainNode.disconnect();
        } catch (e) {
            // evtl. schon gestoppt
        }

        // 💡 Wichtig: Referenzen zurücksetzen
        if (currentOscillator === oscillator) {
            currentOscillator = null;
            currentGainNode = null;
        }

        if (!isOver) {
            enableButtons();
        }

    }, dur * 1000 + 200);
}





