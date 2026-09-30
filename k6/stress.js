// STRESS : paliers croissants au-delà de la charge normale pour trouver le point de rupture
import { sleep } from 'k6'
import { setup as uploadSetup, uploadFile } from './helpers/upload.js'

export const options = {
    stages: [
        { duration: '2m', target: 20 },
        { duration: '3m', target: 20 },
        { duration: '2m', target: 50 },
        { duration: '3m', target: 50 },
        { duration: '2m', target: 100 },
        { duration: '3m', target: 100 },
        { duration: '3m', target: 0 },
    ],
    thresholds: {
        http_req_failed: ['rate<0.05'],
        'http_req_duration{name:upload}': ['p(95)<3000'],
        upload_success: ['rate>0.95'],
    },
}

export function setup() {
    return uploadSetup()
}

export default function (data) {
    uploadFile(data)
    sleep(1)
}