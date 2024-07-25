document.getElementById('reportForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Capture device information
    const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
    };

    // Capture location information
    const locationInfo = await new Promise((resolve) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }),
                (error) => resolve({ latitude: null, longitude: null })
            );
        } else {
            resolve({ latitude: null, longitude: null });
        }
    });

    // Add device and location information to form data
    const formData = new FormData(document.getElementById('reportForm'));
    formData.append('deviceInfo', JSON.stringify(deviceInfo));
    formData.append('locationInfo', JSON.stringify(locationInfo));

    const response = await fetch('/report', {
        method: 'POST',
        body: formData
    });

    const result = await response.json();

    const messageElement = document.getElementById('message');
    const downloadLinkElement = document.getElementById('downloadLink');

    if (result.success) {
        messageElement.textContent = 'Report submitted successfully!';
        if (result.mediaFilename) {
            downloadLinkElement.innerHTML = `Download your uploaded media file <a href="/download/${result.reportId}/${result.mediaFilename}" target="_blank">here</a>.`;
        } else if (result.voiceFilename) {
            downloadLinkElement.innerHTML = `Download your uploaded voice file <a href="/download/${result.reportId}/${result.voiceFilename}" target="_blank">here</a>.`;
        } else {
            downloadLinkElement.innerHTML = '';
        }
    } else {
        messageElement.textContent = 'Error submitting report. Please try again.';
        downloadLinkElement.innerHTML = '';
    }

    document.getElementById('reportForm').reset();
});
