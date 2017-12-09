var env = process.env.NODE_ENV || 'offlineDev';

if (env === 'development' || env === 'test' || env === 'offlineDev') {
    const config = require('./config.json');
    const envConfig = config[env];
    
    Object.keys(envConfig).forEach((key) => {
        process.env[key] = envConfig[key];
    });
}
