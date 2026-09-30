import { test, expect } from './fixtures'
import { login } from './helpers/auth'

import user from './data/user.json' with { type: 'json'}

test.describe('US04 - Login / Logout', () => {

    test.beforeEach(async ({page}) => {
        await page.goto('/')
    })

    test('Should display admin dashboard /=> good credentials', async ({page, selector}) => {
        await selector('admin-link').click()
        await expect(selector('admin-login')).toBeVisible()

        await login(page, true, user)
    })

    test('Should display error message /=> bad credentials', async ({page, selector}) => {
        await selector('admin-link').click()
        await expect(selector('admin-login')).toBeVisible()

        await login(page, false, user)

        await expect(selector('error-message')).toBeVisible()
    })

    test('Should logout successfully', async ({page, selector}) => {
        await selector('admin-link').click()
        await expect(selector('admin-login')).toBeVisible()

        await login(page, true, user)

        await selector('admin-logout').click()
        await expect(selector('public-layout')).toBeVisible()
    })
})