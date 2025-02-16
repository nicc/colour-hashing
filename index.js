import { Hash, Field } from 'o1js';

const interval = 1100;
const nBitsPerColour = 24n; // 6 hex digits is 24 bits
const copiedLabel = document.getElementById("copiedLabel");

let intervalId = null;
let bitQueue = 0n;
let bitLength = 0n;
let hash = null;

function appendBits(newBits) {
    let newBitLength = BigInt(newBits.toString(2).length);
    bitQueue = (bitQueue << newBitLength) | newBits;
    bitLength += newBitLength;
}

function moarBits() {
    if (bitLength < nBitsPerColour) {
        let newHash = recurseHash(); 
        appendBits(newHash);
    }
}

function popColour() {
    moarBits();

    if (bitLength < nBitsPerColour) return null;

    let colourMask = (1n << nBitsPerColour) - 1n; // 24 bit mask
    let colourBits = (bitQueue >> (bitLength - nBitsPerColour)) & colourMask; // take first 24 bits
    bitQueue &= (1n << (bitLength - nBitsPerColour)) - 1n; // drop first 24 bits
    bitLength -= nBitsPerColour;

    return '#'+colourBits.toString(16).padStart(6, '0'); // hex colour code
}

function recurseHash() {
    let textInput = document.getElementById('textInput').value.trim();
    if (!hash) {
        console.log("Submitted text:", textInput);
        // init hash
        let inputInts = Array.from(textInput, char => char.charCodeAt(0));
        let inputFields = inputInts.map(int => Field(int));
        hash = Hash.hash(inputFields).toBigInt()
    } else {
        // recurse hash
        hash = Hash.hash([Field(hash)]).toBigInt();
    }

    return hash;
}

function displayColour(hex) {    
    const container = document.getElementById('sequence');
    const bands = document.querySelectorAll('.colour');

    const band = document.createElement('div');
    band.title = hex;
    band.addEventListener("click", (event) => {
        navigator.clipboard.writeText(hex).then(() => {
            copiedLabel.style.left = `${event.pageX + 10}px`;
            copiedLabel.style.top = `${event.pageY + 10}px`;
            copiedLabel.style.display = "block";
            copiedLabel.innerText = 'Copied ' + hex + '!';

            setTimeout(() => {
                copiedLabel.style.display = "none";
            }, 1000);
            console.log("Copied to clipboard: " + hex);
        }).catch(err => {
            console.error("Failed to copy: ", err);
        });
    });
    band.className = 'colour';
    band.style.backgroundColor = hex;

    container.prepend(band);

    // shift existing bands
    bands.forEach((band, idx) => {
        band.style.transform = 'translateY('+(idx*100)+'px)';
    });

    // cleanup
    setTimeout(() => {
        band.style.transform = '';
    }, 500);
}

function stepThroughColours() {
    let colour = popColour();
    if (colour) displayColour(colour);
}

function clearSequence() {
    clearInterval(intervalId);
    hash = null;
    bitQueue = 0n;
    bitLength = 0n;
    document.getElementById("sequence").replaceChildren();
}

function doTheThing() {
    clearSequence();
    stepThroughColours();
    intervalId = setInterval(stepThroughColours, interval);
}

function handleEnter(event) {
    if (event.key === "Enter") {
        doTheThing();
    }
}

window.doTheThing = doTheThing;
window.handleEnter = handleEnter;