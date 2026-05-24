const {expect}=require("@playwright/test")
async function createBooking(apiContext, payload) {
const response = await apiContext.post("bookings",{data:payload})
await expect(response).toBeOK()
const json=await response.json()
//console.log(json)
await expect(json.data).toHaveProperty('id')
await expect(json.data.bookingRef).toMatch(/[A-Za-z0-9_]*/)
return json
}
module.exports={createBooking}