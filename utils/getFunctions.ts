// Most of these functions can be produced by AI with no issues

export function getRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function getRandomItem<T>(array: T[]): T | null {
    if (!array || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
}

export function getShuffledArray<T>(array: T[]): T[] {
        const arrayCopy = [...array]; // Clone the array
        const shuffledArray = [];
        
        while (arrayCopy.length > 0) {
            const randomIndex = Math.floor(Math.random() * arrayCopy.length);
            const [selectedItem] = arrayCopy.splice(randomIndex, 1); // Remove and get card
            shuffledArray.push(selectedItem);
        }
        
        return shuffledArray;
}


// Using the crypto module (built-in) which generates a random key which we can assign as an ID to objects
export function generateUUID() {
    return crypto.randomUUID(); // Available in Node.js 15.6.0+ and browsers
}