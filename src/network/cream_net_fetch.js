const https = require('https');
const zlib = require('zlib');

function fetch(url, headers = {}) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers }, res => {

            let stream = res;

            if (res.headers['content-encoding'] === 'gzip') {
                stream = res.pipe(zlib.createGunzip());
            } else if (res.headers['content-encoding'] === 'deflate') {
                stream = res.pipe(zlib.createInflate());
            }

            let data = '';
            stream.on('data', chunk => data += chunk);
            stream.on('end', () => resolve(data));
            stream.on('error', reject);

        }).on('error', reject);
    });
}

function fetchJSON(url, headers = {}) {
    return fetch(url, headers).then(JSON.parse);
}

async function getRandomCreamImage() {

    const query = encodeURIComponent('cream the rabbit sonic');

    const headers = {
        'User-Agent': 'Mozilla/5.0',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate',
        'Referer': 'https://duckduckgo.com/'
    };

    try {

        // Step 1 — get search page
        const html = await fetch(`https://duckduckgo.com/?q=${query}`, headers);

        const tokenMatch = html.match(/vqd=['"]?([0-9-]+)['"]?/);
        if (!tokenMatch) {
            throw new Error('vqd token not found');
        }

        const vqd = tokenMatch[1];

        // Step 2 — get image results
        const json = await fetchJSON(
            `https://duckduckgo.com/i.js?q=${query}&vqd=${vqd}&o=json&l=wt-wt&p=1`,
            headers
        );

        const images = (json.results || [])
            .map(r => r.image)
            .filter(Boolean);

        if (images.length === 0) {
             throw new Error('No images returned');
        }

        return images[Math.floor(Math.random() * images.length)];

    } catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports = { getRandomCreamImage };