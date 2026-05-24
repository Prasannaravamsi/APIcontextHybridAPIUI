const { test, expect } = require("@playwright/test")
const { createAuthorizedApiContext } = require("../utils/CreateAuthorizedApiContextHelper")
const { createBooking } = require("../utils/CreateBookingHelper")
const { findBookingCardByRef } = require("../utils/FindBookingCardByRefHelper")
const { injectTokenBeforeNavigation } = require("../utils/InjectTokenBeforeNavigationHelper")
const { lookupBookingByRef } = require("../utils/LookupBookingByRefHelper")
const { parseCurrency } = require("../utils/ParseCurrencyHelper")
const { selectBookableEvent } = require("../utils/SelectBookableEventHelper")
let authorizedApiContext = ""
let apiContext = ""
let token = ""
let reference = ""
let bookingId = ""
let evenId = ""
let title = ""
let category = ""
let city = ""
let price = ""
let venue = ""
let selectedEventFields = ""
let expectedTotalAmount = ""
let ticketQuantity = ""
let parsedBookingResp = ""

test.beforeAll(async ({playwright}) => {
    authorizedApiContext = await createAuthorizedApiContext(playwright, "prasannarao.leo@gmail.com", "Dvithi@123456")
    apiContext = authorizedApiContext.authapiContext
    token = authorizedApiContext.token
})
test("Create a runtime booking through the API and verify the bookings list UI", async ({ page }) => {
    const selectedEvent = await selectBookableEvent(apiContext, 2)
    evenId = selectedEvent.id
    title = selectedEvent.title
    category = selectedEvent.category
    city = selectedEvent.city
    price = selectedEvent.price
    venue = selectedEvent.venue
    // console.log(selectedEvent, evenId, title, category, city, price)
    const CreateBookingInput = {
        "customerName": "pras",
        "customerEmail": "prasa@gmail.com",
        "customerPhone": "9989898989",
        "quantity": 2,
        "eventId": evenId
    }
    parsedBookingResp = await createBooking(apiContext, CreateBookingInput)
    console.log(parsedBookingResp)
    bookingId = parsedBookingResp.data.id
    reference = parsedBookingResp.data.bookingRef
    selectedEventFields = parsedBookingResp.data.event
    expectedTotalAmount = parsedBookingResp.data.totalPrice
    ticketQuantity = parsedBookingResp.data.quantity
    //console.log(bookingId,reference,selectedEventFields,expectedTotalAmount)
    const lookBookUp = await lookupBookingByRef(apiContext, bookingId)
    await expect(lookBookUp.data.id).toBe(bookingId)
    await expect(lookBookUp.data.bookingRef).toBe(reference)
    await expect(lookBookUp.data.totalPrice).toBe(expectedTotalAmount)
    await expect(lookBookUp.data.quantity).toBe(ticketQuantity)
    await injectTokenBeforeNavigation(page, token)
    await page.goto("/bookings")
    await expect(page.locator("h1.text-3xl")).toBeVisible()
    const selectedRRef = await findBookingCardByRef(page, reference)
    await expect(selectedRRef.locator("h3.font-semibold")).toHaveText(title)
    const totalPrice = await selectedRRef.locator("p.text-xl").textContent()
    await expect(await selectedRRef.locator("span:has-text('ticket')")).toContainText(parsedBookingResp.data.quantity.toString())
    await expect(parseCurrency(totalPrice.replace(",", ""))).toBe(parseInt(parsedBookingResp.data.totalPrice))
})

test("Reconcile the booking detail page and cancel through the API", async ({ page }) => {
    await injectTokenBeforeNavigation(page, token)
    await page.goto("/bookings")
    const selectedRRef = await findBookingCardByRef(page, reference)
    await selectedRRef.locator("button:has-text('View Details')").click()
    await page.waitForURL("https://eventhub.rahulshettyacademy.com/bookings/" + bookingId)
    const endURL = await page.url().split(".com")[1].trim()
    await expect(endURL).toBe("/bookings/" + bookingId)
    await expect(page.locator("a ~ span.font-mono")).toHaveText(reference)
    const event = page.locator("div.flex").filter({ hasText: "Event" }).locator("span.font-medium")
    const selCategory = page.locator("div.flex").filter({ hasText: "Category" }).locator("span.font-medium")
    const selVenue = page.locator("div.flex").filter({ hasText: "Venue" }).locator("span.font-medium")
    const selCity = page.locator("div.flex").filter({ hasText: "City" }).locator("span.font-medium")
    await expect(event).toHaveText(title)
    await expect(selCategory).toHaveText(category)
    await expect(selVenue).toHaveText(venue)
    await expect(selCity).toHaveText(city)
    await expect(parseInt(await page.locator("div.flex").filter({ hasText: "Tickets" }).locator("span.font-medium").textContent())).toBe(ticketQuantity)
    const ticketPrice = await page.locator("div.flex").filter({ hasText: "Total Paid" }).locator("span.font-bold").textContent()
    await expect(parseCurrency(ticketPrice.replace(",", ""))).toBe(parseInt(expectedTotalAmount))
    await expect(page.locator("div.flex").filter({ hasText: "Email" }).locator("span.font-medium")).toHaveText(parsedBookingResp.data.customerEmail)
    const resp = await apiContext.delete("bookings/"+bookingId,{
        // headers:{
        //     'Authorization': "Bearer " + token,
        //     'Content-type': "application/json"
        // }
    })
    console.log(resp)
    await expect(resp).toBeOK()
    try {
    await lookupBookingByRef(apiContext, bookingId)
     throw new Error("Booking exits")
     } catch (error) {
    // Expected: booking not found
    //console.log(error.message)
    expect(error.message).toContain("404")
}
    await page.goto("/bookings")
    const bookingCard=await findBookingCardByRef(page, reference)
    await expect(bookingCard).toHaveCount(0)
    await apiContext.dispose()
})

