import { test, expect } from './fixtures'

test.describe('US03 - Account Creation', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/register')
    })

    test('Should display registration form', async ({selector}) => {
        await expect(selector('register-form')).toBeVisible()
        await expect(selector('email')).toBeVisible()
        await expect(selector('password')).toBeVisible()
        await expect(selector('password-confirmation')).toBeVisible()
        await expect(selector('login-link')).toBeVisible()
        await expect(selector('register-button')).toBeVisible()
    })

    test('Should allow user to register', async ({ page, selector }) => {
        await selector('email').fill('test@example.com')
        await selector('password').fill('password123')
        await selector('password-confirmation').fill('password123')

        const [request] = await Promise.all([
            page.waitForRequest(req => req.method() === 'POST' && req.url().includes('/auth/register')),
            selector('register-button').click()
        ])

        const body = request.postDataJSON()
        expect(body).toMatchObject({
            email: 'test@example.com',
            password: 'password123'
        })

        const response = await request.response()
        expect(response?.status()).toBe(201)
    })

    test('Should display error message for invalid email', async ({selector }) => {
        await selector('email').fill('invalid-email')
        await selector('password').fill('password123')
        await selector('password-confirmation').fill('password123')

        await selector('register-button').click()

        await expect(selector('bad-email')).toBeVisible()
    })
})