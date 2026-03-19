const { getRandomImage } = require('./imageFetcher');

async function getRandomSonicexeImage() {
    return getRandomImage({
        query: 'sonic.exe creepypasta',
        provider: 'duckduckgo'
    });
}

module.exports = { getRandomSonicexeImage };