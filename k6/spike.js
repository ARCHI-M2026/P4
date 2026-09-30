// SPIKE : pic brutal de trafic puis retour à la normale, pour vérifier que l'API encaisse et récupère
import { sleep } from 'k6'
import { setup as uploadSetup, uploadFile } from './helpers/upload.js'

export const options = {
    stages: [
        { duration: '1m', target: 5 },
        { duration: '10s', target: 100 },
        { duration: '1m', target: 100 },
        { duration: '10s', target: 5 },
        { duration: '2m', target: 5 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_failed: ['rate<0.10'],
        'http_req_duration{name:upload}': ['p(95)<5000'],
        upload_success: ['rate>0.90'],
    },
}

export function setup() {
    return uploadSetup()
}

export default function (data) {
    uploadFile(data)
    sleep(1)
}