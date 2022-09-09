//get buttons
let discord = document.getElementById("discord")
let steam = document.getElementById("steam")

//links that the buttons will send the user to
let discordLink = "https://discord.gg/k5Grv8F"
let steamLink = "https://steamcommunity.com/profiles/76561198858080271/"

//button click logic
discord.addEventListener("click", () => {
    open(discordLink)
})

steam.addEventListener("click", () => {
    open(steamLink)
})

