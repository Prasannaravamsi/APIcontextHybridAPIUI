const {request}=require("@playwright/test")

async function selectBookableEvent(apiContext, minimumSeats) {
const reponse=await apiContext.get("events")
const jsonResponse=await reponse.json()
console.log(jsonResponse)
const event= jsonResponse.data.find(m=>m.availableSeats>2)
//  console.log(event)
return event
}
module.exports={selectBookableEvent}