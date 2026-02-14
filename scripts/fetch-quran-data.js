import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_PATH = path.join(__dirname, '../src/constants/quran-full.json');

// Editions to fetch
const EDITIONS = [
    { key: 'ar.quran-uthmani', type: 'arabic' },
    { key: 'en.sahih', type: 'english' },
    { key: 'en.transliteration', type: 'transliteration' }
];

async function fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            if (i === retries - 1) throw error;
            console.log(`\nRetrying ${url} (${i + 1}/${retries})...`);
            await new Promise(res => setTimeout(res, 1000 * (i + 1)));
        }
    }
}

async function fetchQuranDataEnriched() {
    const allData = {};
    console.log("Starting enriched Quran data extraction (Arabic, English, Transliteration)...");

    for (let i = 1; i <= 114; i++) {
        process.stdout.write(`Fetching Surah ${i}/114... `);
        try {
            // Fetch multiple editions in parallel for the current Surah
            const [arabic, english, transliteration] = await Promise.all(
                EDITIONS.map(ed => fetchWithRetry(`https://api.alquran.cloud/v1/surah/${i}/${ed.key}`))
            );

            // Merge ayahs
            allData[i] = arabic.data.ayahs.map((ayah, idx) => ({
                id: ayah.number,
                number: ayah.numberInSurah,
                text: ayah.text,
                translation: english.data.ayahs[idx].text,
                transliteration: transliteration.data.ayahs[idx].text
            }));

            console.log(`Success (${allData[i].length} Ayahs)`);
        } catch (error) {
            console.error(`\nFailed to fetch Surah ${i}:`, error.message);
            process.exit(1);
        }

        // Polite pause
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log("Finalizing enriched dataset...");
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allData, null, 2));
    console.log(`Production enriched dataset saved to: ${OUTPUT_PATH}`);
}

fetchQuranDataEnriched();
