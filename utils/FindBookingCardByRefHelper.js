const {Page}=require("@playwright/test")

async function findBookingCardByRef(page, bookingRef){
return await page.locator("#booking-card").filter({hasText:bookingRef})
}
module.exports={findBookingCardByRef}