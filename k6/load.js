// LOAD : charge normale attendue (montée à 20 VUs, plateau de 5 min)
import { sleep } from 'k6'
import { setup as uploadSetup, uploadFile } from './helpers/upload.js'

export const options = {
    stages: [
        { duration: '2m', target: 20 },
        { duration: '5m', target: 20 },
        { duration: '2m', target: 0 },
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'],
        'http_req_duration{name:upload}': ['p(95)<1500', 'p(99)<3000'],
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