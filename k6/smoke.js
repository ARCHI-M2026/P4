// SMOKE : vérifie que l'upload fonctionne sous une charge minimale (2 VUs, 1 min)
import { sleep } from 'k6'
import { setup as uploadSetup, uploadFile } from './helpers/upload.js'

export const options = {
    vus: 2,
    duration: '1m',
    thresholds: {
        http_req_failed: ['rate<0.01'],
        'http_req_duration{name:upload}': ['p(95)<1000'],
        upload_success: ['rate>0.99'],
    },
}

export function setup() {
    return uploadSetup()
}

export default function (data) {
    uploadFile(data)
    sleep(1)
}