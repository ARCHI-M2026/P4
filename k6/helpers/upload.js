// Logique commune aux tests de performance de l'upload (POST /file)
import http from 'k6/http'
import { check, fail } from 'k6'
import { Rate, Trend } from 'k6/metrics'

const API_HOST = __ENV.API_HOST || 'localhost'
const API_PORT = __ENV.API_PORT || '3000'
export const BASE_URL = __ENV.BASE_URL || `http://${API_HOST}:${API_PORT}`

const EMAIL = __ENV.PERF_EMAIL || 'test@test.com'
const PASSWORD = __ENV.PERF_PASSWORD || '123456789'
const FILE_SIZE_KB = Number(__ENV.FILE_SIZE_KB || 100)

// Fichier texte généré en mémoire : pas besoin de monter un fichier dans le conteneur
const fileContent = 'x'.repeat(FILE_SIZE_KB * 1024)

export const uploadDuration = new Trend('upload_duration', true)
export const uploadSuccess = new Rate('upload_success')

const JSON_PARAMS = { headers: { 'Content-Type': 'application/json' } }

function login() {
    const res = http.post(
        `${BASE_URL}/auth/login`,
        JSON.stringify({ email: EMAIL, password: PASSWORD }),
        { ...JSON_PARAMS, tags: { name: 'login' } },
    )
    if (res.status !== 200 && res.status !== 201) {
        fail(`Connexion impossible (${res.status}) : ${res.body}`)
    }
    return res.json('access_token')
}

// Exécuté une seule fois avant le test : crée le compte de test si besoin et récupère un token
export function setup() {
    const res = http.post(
        `${BASE_URL}/auth/register`,
        JSON.stringify({ email: EMAIL, password: PASSWORD }),
        {
            ...JSON_PARAMS,
            tags: { name: 'register' },
            // 401 attendu si le compte existe déjà : ne pas le compter comme erreur
            responseCallback: http.expectedStatuses(201, 401),
        },
    )
    // 201 = compte créé, 401 = le compte existe déjà (comportement de l'API)
    if (res.status !== 201 && res.status !== 401) {
        fail(`Inscription impossible (${res.status}) : ${res.body}`)
    }
    return { token: login() }
}

// Token propre à chaque VU, renouvelé si le JWT expire (JWT_DURING=1h)
let vuToken = null

function postFile(token) {
    return http.post(
        `${BASE_URL}/file`,
        {
            file: http.file(fileContent, `k6-vu${__VU}-it${__ITER}.txt`, 'text/plain'),
            expiresInDays: '1',
        },
        {
            headers: { Authorization: `Bearer ${token}` },
            tags: { name: 'upload' },
            // Un 401 (token expiré) est rejoué juste après : le check ci-dessous reste le juge
            responseCallback: http.expectedStatuses(201, 401),
        },
    )
}

export function uploadFile(data) {
    let res = postFile(vuToken || data.token)

    if (res.status === 401) {
        vuToken = login()
        res = postFile(vuToken)
    }

    const ok = check(res, {
        'upload : statut 201': r => r.status === 201,
        'upload : id renvoyé': r => {
            try {
                return Boolean(r.json('id'))
            } catch {
                return false
            }
        },
    })

    uploadSuccess.add(ok)
    uploadDuration.add(res.timings.duration)
}