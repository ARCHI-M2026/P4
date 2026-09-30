import { test, expect } from './fixtures'
import { login } from './helpers/auth'

import user from './data/user.json' with { type: 'json'}

test.describe('US06 - Delete File', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/')
    })

    test('Should delete one file from list', async ({ page, selector }) => {
        await selector('admin-link').click()
        await expect(selector('admin-login')).toBeVisible()

        await login(page, true, user)

        const rows = selector('file-item')

        await expect(rows.first()).toBeVisible()
        const initialCount = await rows.count()

        page.once('dialog', dialog => dialog.accept())
        await rows.first().locator('[test-id="delete-file"]').click()

        await expect(rows).toHaveCount(initialCount - 1)

    })
})