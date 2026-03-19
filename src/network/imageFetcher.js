const https = require('https');
const zlib = require('zlib');

function fetch(url, headers = {}) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers }, res => {

            let stream = res;
            if (res.headers['content-encoding'] === 'gzip') stream = res.pipe(zlib.createGunzip());
            else if (res.headers['content-encoding'] === 'deflate') stream = res.pipe(zlib.createInflate());

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

const DEFAULT_HEADERS = {
    'User-Agent': 'Mozilla/5.0',
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate'
};

/**
 * DuckDuckGo image search
 */
async function duckduckgoImageSearch(query) {
    const encoded = encodeURIComponent(query);
    const html = await fetch(`https://duckduckgo.com/?q=${encoded}`, { ...DEFAULT_HEADERS, 'Referer': 'https://duckduckgo.com/' });

    const tokenMatch = html.match(/vqd=['"]?([0-9-]+)['"]?/);
    if (!tokenMatch) throw new Error('DuckDuckGo vqd token not found');
    const vqd = tokenMatch[1];

    const json = await fetchJSON(`https://duckduckgo.com/i.js?q=${encoded}&vqd=${vqd}&o=json&l=wt-wt&p=1`, DEFAULT_HEADERS);
    return (json.results || []).map(r => r.image).filter(Boolean);
}

/**
 * Bing free search (HTML scraping)
 */
async function bingImageSearch(query) {
    const encoded = encodeURIComponent(query);
    const html = await fetch(`https://www.bing.com/images/search?q=${encoded}`, { ...DEFAULT_HEADERS, 'Referer': 'https://www.bing.com/' });

    const urls = [];
    const regex = /"murl":"(https?:\/\/[^"]+)"/g;
    let match;
    while ((match = regex.exec(html)) !== null) urls.push(match[1]);

    return urls;
}

/**
 * Qwant image search
 */
async function qwantImageSearch(query) {
    const encoded = encodeURIComponent(query);
    const json = await fetchJSON(`https://api.qwant.com/api/search/images?count=50&q=${encoded}&t=images&safesearch=1&locale=en_US&uiv=4`, DEFAULT_HEADERS);
    return (json.data?.result?.items || []).map(i => i.media).filter(Boolean);
}

/**
 * Public API
 */
const PROVIDERS = {
    duckduckgo: duckduckgoImageSearch,
    bing: bingImageSearch,
    qwant: qwantImageSearch
};

async function getRandomImage({ query, provider } = {}) {
    let selectedProvider = provider;

    // Pick a random provider if not specified
    if (!selectedProvider) {
        const keys = Object.keys(PROVIDERS);
        selectedProvider = keys[Math.floor(Math.random() * keys.length)];
    }

    const searchFn = PROVIDERS[selectedProvider];
    if (!searchFn) throw new Error(`Unknown provider: ${selectedProvider}`);

    const results = await searchFn(query);
    if (!results.length) throw new Error(`No images found for "${query}" with ${selectedProvider}`);

    return results[Math.floor(Math.random() * results.length)];
}

module.exports = { getRandomImage, PROVIDERS };