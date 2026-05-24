const { Page } = require("@playwright/test")


async function injectTokenBeforeNavigation(page, token) {
    await page.addInitScript(value => {
        window.localStorage.setItem("eventhub_token",value)},token);
}

module.exports = { injectTokenBeforeNavigation }