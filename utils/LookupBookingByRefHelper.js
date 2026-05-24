const {expect}=require("@playwright/test")
async function lookupBookingByRef(apiContext, bookingRef) {
const response= await apiContext.get("bookings/"+bookingRef)
await expect(response).toBeOK()
const jsonResponse=await response.json()
//console.log(jsonResponse)
return jsonResponse
}
module.exports={lookupBookingByRef}