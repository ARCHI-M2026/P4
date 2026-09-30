import { test, expect } from './fixtures'
import { login } from './helpers/auth'

import user from './data/user.json' with { type: 'json'}
import path from 'path'

test.describe.serial('US01/US02 - Upload and Download File', () => {
    let fileUrl: string

    test.beforeEach(async ({ page }) => {
        await page.goto('/')
    })

    test('Should display confirmation message', async ({ page, selector }) => {
        await selector('admin-link').click()
        await expect(selector('admin-login')).toBeVisible()

        await login(page, true, user)
        await expect(selector('go-to-upload')).toBeVisible()

        await selector('go-to-upload').click()

        await expect(selector('upload-page')).toBeVisible()

        const testFilePath = path.join(__dirname, 'data', 'test-file.txt')
        await selector('input-upload').setInputFiles(testFilePath)

        await selector('upload-button').click()

        await expect(selector('upload-confirmation')).toBeVisible()
        fileUrl = (await selector('file-url').getAttribute('href'))!
        expect(fileUrl).toBeTruthy()

    })


    test('Should display download file', async ({ page, selector }) => {
        await page.goto(fileUrl)
        await expect(selector('download-page')).toBeVisible()

        const [download] = await Promise.all([
            page.waitForEvent('download'),
            selector('download-button').click()
        ])

        expect(download.suggestedFilename()).toBe('test-file.txt')
    })

})