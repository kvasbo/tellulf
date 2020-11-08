module.exports = {
    apps: [{
        name: 'Solar Uploader',
        script: './dist/solaruploader.js',
        env: {
            FIREBASE_USER: 'x',
            FIREBASE_PASSWORD: 'z',
            STECA_IP: '192.168.1.146',
        },
    }, ],
};