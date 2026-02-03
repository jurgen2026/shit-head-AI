export default function delay(ms: number) {
    console.log('\n');
    return new Promise(resolve => setTimeout(resolve, ms));
}