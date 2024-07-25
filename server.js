const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Set up storage for files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Determine where to save the file
        const reportId = req.body.reportId;
        const mediaFolder = path.join(__dirname, 'media');
        const reportFolder = path.join(__dirname, 'reports');

        // Create the directories if they do not exist
        if (!fs.existsSync(mediaFolder)) fs.mkdirSync(mediaFolder);
        if (!fs.existsSync(reportFolder)) fs.mkdirSync(reportFolder);

        cb(null, mediaFolder); // Save media files in the 'media' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Serve static files
app.use(express.static('public'));

// Handle POST requests for report submission
app.post('/report', upload.single('media'), (req, res) => {
    const { title, description } = req.body;
    const mediaFile = req.file;

    if (!title || !description) {
        return res.status(400).json({ success: false, message: 'Title and description are required.' });
    }

    // Save text report
    const reportId = Date.now(); // Unique ID for the report
    const reportFilePath = path.join(__dirname, 'reports', `${reportId}.txt`);

    fs.writeFileSync(reportFilePath, `Title: ${title}\nDescription: ${description}\n`);

    // Response message
    res.json({
        success: true,
        reportId,
        mediaFilename: mediaFile ? mediaFile.filename : null,
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
