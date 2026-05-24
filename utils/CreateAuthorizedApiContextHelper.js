const { request } = require("@playwright/test")
async function createAuthorizedApiContext(playwright, email, password) {
    const API_BASE_URL = "https://api.eventhub.rahulshettyacademy.com/api/"
    const loginPayload = { email: email, password: password }
    //     const apiContext= await request.newContext()
    // const response=await apiContext.post("https://api.eventhub.rahulshettyacademy.com/api/auth/login",{data:loginPayload})
    // const jsonResonse=await response.json()
    // const token = jsonResonse.token
    const apiContext = await playwright.request.newContext({
        baseURL:API_BASE_URL,extraHTTPHeaders: {
            'Content-type': "application/json"
        }
    })
    const response =await apiContext.post("auth/login", { data: loginPayload })
    const jsonResp = await response.json()
    const token = jsonResp.token
    console.log(token)

    const authapiContext = await playwright.request.newContext({
        baseURL: API_BASE_URL, extraHTTPHeaders: {
            'Authorization': "Bearer " + token,
            'Content-type': "application/json"
        }
    })
   return {authapiContext,token}
   
}

module.exports = { createAuthorizedApiContext }