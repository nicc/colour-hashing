import { Hash, Field } from 'o1js';
import pkg from 'canvas';
const { createCanvas } = pkg;
import { writeFile } from 'fs/promises';

const names = ["Bob", "Alice"];

async function generateColourBands(hexValues, name, width = 600, height = 100) {
    const outputPath = './pngs/'+name+'.png';
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const bandWidth = width / hexValues.length; // Equal width for each color band

    hexValues.forEach((hex, index) => {
        ctx.fillStyle = `#${hex}`;
        // ctx.fillStyle = `#898934`;
        ctx.fillRect(index * bandWidth, 0, bandWidth, height);
    });

    // Convert canvas to PNG buffer
    const buffer = canvas.toBuffer('image/png');

    // Write buffer to file
    await writeFile(outputPath, buffer);
    console.log(`Image saved as ${outputPath}`);
}

const outputLength = 2 * 3 * 8; // 2 hex values per colour channel. 3 channels per colour (no alpha). 8 colours
const numBits = 4n; // a single hex digit
// const numChunks = 64n / numBits;
 const numChunks = 254n / numBits; // bigints are 64-bit

function hexRecursiveHashes(acc, chunkIndex, input) {
    if (chunkIndex < numChunks) {
        let rightShift = chunkIndex * numBits;
        let chunk = ((1n << numBits) - 1n) & (input >> rightShift);

        return hexTheHash([...acc, chunk.toString(16)], chunkIndex+1n, input);
    } else { // recur on a hash of the hash
        return hexTheHash(acc, 0n, Hash.hash([Field(input)]).toBigInt());
    }
}

function hexTheHash(acc, chunkIndex, input) {
    if (acc.length == outputLength) {
        return acc;
    } else {       
        return hexRecursiveHashes(acc, chunkIndex, input);
    }
}

function hexThatPerson(name) {
    let inputInts = Array.from(name, char => char.charCodeAt(0));
    let inputFields = inputInts.map(int => Field(int));
    let outputInt = Hash.hash(inputFields).toBigInt()
    let hexes = hexTheHash([], 0n, outputInt);
    let colours = toHexColourStrings(hexes);

    generateColourBands(colours, name, 800, 200);
    console.log(name + ": " + colours);
}

function toHexColourStrings(arr) {
    let result = [];
    for (let i = 0; i < arr.length; i += 6) {
        result.push(arr.slice(i, i + 6).join(''));
    }
    return result;
}

names.forEach(hexThatPerson);

