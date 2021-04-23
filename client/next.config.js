const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')
module.exports = (phase, { defaultConfig }) => {
    if (phase === PHASE_DEVELOPMENT_SERVER) {
        return {        
            async rewrites() {
                return [
                    {
                    source: '/api/:path*',
                    destination: 'http://localhost:5000/api/:path*' // Proxy to Backend
                    }
                ]
            }
        }
    }
    return defaultConfig;    
}