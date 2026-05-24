function parseCurrency(text){
return parseInt(text.split("$")[1].trim())
}

module.exports={parseCurrency}