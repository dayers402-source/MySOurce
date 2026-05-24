const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
const { Readable } = require('stream');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MEGA API Configuration
const MEGA_API_URL = 'https://g.api.mega.co.nz/cs';

// Folder configurations with decryption keys
const folders = [
    {
        name: 'MEGA Folder 1',
        folderHandle: 'XN1m2DDQ',
        masterKey: 'rl8oiMaH5TRilXg2IDP20A',
        url: 'https://mega.nz/folder/qRkyjTpb#rl8oiMaH5TRilXg2IDP20A/folder/XN1m2DDQ',
        sectionId: 'mega1'
    },
    {
        name: 'MEGA Folder 2',
        folderHandle: '765miLDD',
        masterKey: 'TlyyDVsXGC1xO327t6pAtw',
        url: 'https://mega.nz/folder/7vonTSbK#TlyyDVsXGC1xO327t6pAtw/folder/765miLDD',
        sectionId: 'mega2'
    }
];

// Helper function to decode MEGA base64
function megaBase64Decode(s) {
    s += '=='.substr((2 - s.length * 3) & 3);
    return Buffer.from(s.replace(/\-/g, '+').replace(/_/g, '/'), 'base64');
}

// Helper function to decrypt MEGA data
function decryptMegaData(data, key) {
    try {
        const decipher = crypto.createDecipheriv('aes-128-ecb', key, '');
        return Buffer.concat([
            decipher.update(Buffer.from(data, 'base64')),
            decipher.final()
        ]);
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
}

// Fetch media from MEGA folder
async function fetchMegaFolderContents(folderInfo) {
    try {
        const mediaItems = [];
        
        // Parse the master key
        const masterKeyBuffer = megaBase64Decode(folderInfo.masterKey);
        
        // Create API request
        const requestData = [
            {
                a: 'f',
                c: 1,
                r: 1,
                ca: 1
            }
        ];

        const response = await axios.post(
            `${MEGA_API_URL}?id=0`,
            requestData,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }
        );

        // Process response and extract files
        if (response.data && response.data.f) {
            response.data.f.forEach(file => {
                // Filter for media files only
                const fileName = file.n || 'Unknown';
                const ext = fileName.split('.').pop().toLowerCase();
                
                if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'mov', 'avi'].includes(ext)) {
                    const isVideo = ['mp4', 'webm', 'mov', 'avi'].includes(ext);
                    
                    mediaItems.push({
                        id: file.h,
                        name: fileName,
                        size: file.s,
                        type: isVideo ? 'video' : 'image',
                        ext: ext,
                        k: file.k,
                        downloadUrl: `https://mega.nz/file/${file.h}#${folderInfo.masterKey}`,
                        section: folderInfo.name
                    });
                }
            });
        }

        return mediaItems;
    } catch (error) {
        console.error(`Error fetching MEGA folder ${folderInfo.name}:`, error.message);
        return [];
    }
}

// Fetch from leakz.fun website
async function fetchLeakzFun() {
    try {
        const mediaItems = [];
        
        const response = await axios.get('https://leakz.fun', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
        });

        const html = response.data;
        
        // Extract image sources
        const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
        let imgMatch;
        let imgIndex = 0;
        
        while ((imgMatch = imgRegex.exec(html)) !== null) {
            const url = imgMatch[1];
            if (url && !url.includes('data:image')) {
                mediaItems.push({
                    id: `leakz-img-${imgIndex}`,
                    name: `Image from leakz.fun ${imgIndex + 1}`,
                    type: 'image',
                    url: url,
                    section: 'leakz.fun',
                    source: 'website'
                });
                imgIndex++;
            }
        }

        // Extract video sources
        const videoRegex = /<video[^>]*>.*?<source[^>]+src=["']([^"']+)["'][^>]*>.*?<\/video>/gis;
        let videoMatch;
        let videoIndex = 0;
        
        while ((videoMatch = videoRegex.exec(html)) !== null) {
            const url = videoMatch[1];
            if (url) {
                mediaItems.push({
                    id: `leakz-vid-${videoIndex}`,
                    name: `Video from leakz.fun ${videoIndex + 1}`,
                    type: 'video',
                    url: url,
                    section: 'leakz.fun',
                    source: 'website'
                });
                videoIndex++;
            }
        }

        return mediaItems;
    } catch (error) {
        console.error('Error fetching leakz.fun:', error.message);
        return [];
    }
}

// Main API endpoint to get all media
app.get('/api/media', async (req, res) => {
    try {
        const allMedia = {
            sections: [],
            totalItems: 0
        };

        // Fetch from MEGA folders
        for (const folder of folders) {
            console.log(`Fetching media from ${folder.name}...`);
            const megaMedia = await fetchMegaFolderContents(folder);
            
            if (megaMedia.length > 0) {
                allMedia.sections.push({
                    name: folder.name,
                    id: folder.sectionId,
                    count: megaMedia.length,
                    items: megaMedia
                });
                allMedia.totalItems += megaMedia.length;
            }
        }

        // Fetch from leakz.fun
        console.log('Fetching media from leakz.fun...');
        const leakzMedia = await fetchLeakzFun();
        
        if (leakzMedia.length > 0) {
            allMedia.sections.push({
                name: 'leakz.fun',
                id: 'leakz',
                count: leakzMedia.length,
                items: leakzMedia
            });
            allMedia.totalItems += leakzMedia.length;
        }

        res.json(allMedia);
    } catch (error) {
        console.error('Error in /api/media:', error);
        res.status(500).json({ error: 'Failed to fetch media', details: error.message });
    }
});

// Get single section
app.get('/api/media/:section', async (req, res) => {
    try {
        const sectionId = req.params.section;
        const allMedia = await fetchAllMedia();
        
        const section = allMedia.sections.find(s => s.id === sectionId);
        
        if (section) {
            res.json(section);
        } else {
            res.status(404).json({ error: 'Section not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch section', details: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📁 Media API available at http://localhost:${PORT}/api/media`);
    console.log('\nConfigured folders:');
    folders.forEach(f => console.log(`  - ${f.name}`));
});

module.exports = app;