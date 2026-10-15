import fs from 'node:fs';

const content = fs.readFileSync('src/data/productPricingSeed.ts', 'utf-8');
const keyMatches = [...content.matchAll(/^\s*"([^"]+)":\s*\{/gm)].map(m => m[1]);
console.log('Total keys in seed:', keyMatches.length);
console.log('iMac products:', keyMatches.filter(id => id.includes('imac')));
console.log('Air products:', keyMatches.filter(id => id.includes('air')));
console.log('iPhone products:', keyMatches.filter(id => id.includes('iphone')));
console.log('Mac products:', keyMatches.filter(id => id.includes('mac')));
console.log('iPad products:', keyMatches.filter(id => id.includes('ipad')));
console.log('Watch products:', keyMatches.filter(id => id.includes('watch')));
console.log('AirPods products:', keyMatches.filter(id => id.includes('airpod')));
