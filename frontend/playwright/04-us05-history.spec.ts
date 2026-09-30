import { test, expect } from './fixtures'
import { login } from './helpers/auth'

import user from './data/user.json' with { type: 'json'}

test.describe('US06 - Delete File', () => {

    test.beforeEach(async ({page}) => {
        await page.goto('/')
    })

    test('Should display file list', async ({page, selector}) => {
        await selector('admin-link').click()
        await expect(selector('admin-login')).toBeVisible()

        await login(page, true, user)

        const rows = selector('file-item')

        await expect(rows).not.toHaveCount(0)
    })
})