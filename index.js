import dotenv from 'dotenv';
dotenv.config();

import { Client, GatewayIntentBits } from 'discord.js';

import { DiscordInteractions } from "slash-commands";

import express from 'express';

// Create a new express app
const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('pages/index')
})
app.listen(port, () => {
  console.log(`App listening at port ${port}`)
})

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent
    ],
});

var connectionsChannel = null;
var splitNumberAndPuzzel = null;
var users = [];
var currentUser = 0;
var userNotFound = false;

// Log in to Discord with your app's token
client.login(process.env.DISCORD_TOKEN);

const interactions = new DiscordInteractions({
    applicationId: process.env.APPLICATION_ID,
    authToken: process.env.DISCORD_TOKEN,
    publicKey: process.env.PUBLIC_KEY,
});

const command = {
    name: "stats",
    description: "Collect Connections data from the connections channel and displys it",
    options: [
        {
            name: "user",
            description: "The user you want to get the stats of",
            type: 6,
        },
    ],
};

//creates a /top command to show a leaderboard of the top 10 users, has a mantatory option drop down to choose between what top stat you want to show (win rate, correct answers, etc.)
const topCommand = {
    name: "top",
    description: "Shows the top 10 users of what ever stat you choose",
    options: [
        {
            name: "stat",
            description: "The stat you want to see the top 10 of",
            type: 3,
            required: true,
            choices: [
                {
                    name: "Win Rate",
                    value: "winRate",
                },
                {
                    name: "Correct Answers",
                    value: "answerCorrect",
                },
                {
                    name: "Correct Answer Rate",
                    value: "correctAnswerRate",
                },
                {
                    name: "Yellow Correct",
                    value: "yellowCorrect",
                },
                {
                    name: "Green Correct",
                    value: "greenCorrect",
                },
                {
                    name: "Blue Correct",
                    value: "blueCorrect",
                },
                {
                    name: "Purple Correct",
                    value: "purpleCorrect",
                },
                {
                    name: "Incorrect Answers",
                    value: "answerIncorrect",
                },
                {
                    name: "Loss",
                    value: "loss",
                },
            ],
        },
    ],
};

// Register the commands
await interactions.createApplicationCommand(command)
await interactions.createApplicationCommand(topCommand)

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
    
    // Get the general category id and the connections channel id
    const channels = client.channels.cache.map(channels => channels);
    for (let channel of channels){
        if (channel.name === "connections-🟨🟩🟦🟪"){
            connectionsChannel = channel;
            console.log("Connections channel id: " + connectionsChannel);
        }
    }
});

//data collection function
async function collectData() {
    users = [];
    const messages = await connectionsChannel.messages.fetch({ limit: 100 });
    for (let [, message] of messages){
        const splitMessage = message.content.split(" ");
        if (splitMessage[0] === "Connections"){
            //gets the username of the author of the message
            const author = message.author.displayName;
            //splits the NumberAndPuzzel into two parts and gets the number
            const NumberAndPuzzel = splitMessage[2];
            splitNumberAndPuzzel = NumberAndPuzzel.split("");
            //deletes all "\n" in the array
            for (let i = 0; i < splitNumberAndPuzzel.length; i++){
                if (splitNumberAndPuzzel[i] === "\n"){
                    splitNumberAndPuzzel.splice(i, 1);
                }
            }
            //joins each pair '\ud83d' '\udfea', '\ud83d' '\udfe8', '\ud83d' '\udfe9', '\ud83d' '\udfe6' into a joinet pair
            for (let i = 0; i < splitNumberAndPuzzel.length; i++){
                if (splitNumberAndPuzzel[i] === "\ud83d"){
                    if (splitNumberAndPuzzel[i + 1] === "\udfea" || splitNumberAndPuzzel[i + 1] === "\udfe8" || splitNumberAndPuzzel[i + 1] === "\udfe9" || splitNumberAndPuzzel[i + 1] === "\udfe6"){
                        splitNumberAndPuzzel[i] = splitNumberAndPuzzel[i] + splitNumberAndPuzzel[i + 1];
                        splitNumberAndPuzzel.splice(i + 1, 1);
                    }
                }
            }
            //get rid of the first 3 elements (4 if the 4th is a number) in the array to get the data
            splitNumberAndPuzzel.shift();
            splitNumberAndPuzzel.shift();
            splitNumberAndPuzzel.shift();
            splitNumberAndPuzzel.shift();
            if (!["🟨", "🟩", "🟦", "🟪"].includes(splitNumberAndPuzzel[0])) {
                console.log("shifted again with: " + splitNumberAndPuzzel[0]);
                splitNumberAndPuzzel.shift();
            }
            var yellowCorrect = 0;
            var greenCorrect = 0;
            var blueCorrect = 0;
            var purpleCorrect = 0;
            var answerCorrect = 0;
            var answerIncorrect = 0;
            var win = 0;
            var loss = 0;
            //for every 4 elements in the array, check to see if they are the same and if so increment a per user counter on the color they are
            for (let i = 0; i < splitNumberAndPuzzel.length; i += 4){
                if (splitNumberAndPuzzel[i] === splitNumberAndPuzzel[i + 1] && splitNumberAndPuzzel[i] === splitNumberAndPuzzel[i + 2] && splitNumberAndPuzzel[i] === splitNumberAndPuzzel[i + 3]){
                    if (splitNumberAndPuzzel[i] === "🟨"){
                        yellowCorrect++;
                    }
                    else if (splitNumberAndPuzzel[i] === "🟩"){
                        greenCorrect++;
                    }
                    else if (splitNumberAndPuzzel[i] === "🟦"){
                        blueCorrect++;
                    }
                    else if (splitNumberAndPuzzel[i] === "🟪"){
                        purpleCorrect++;
                    }
                    answerCorrect++;
                }
                else {
                    answerIncorrect++;
                }
            }
            //check to see if 4 answer are correct and increment the win counter if not increment the loss counter
            if (answerCorrect === 4){
                win++;
            }
            else {
                loss++;
            }
            var userExists = false;
            for (let user of users){
                if (user.name === author){
                    userExists = true;
                    user.connections++;
                    if (yellowCorrect > 0){
                        user.yellowCorrect += yellowCorrect;
                    }
                    if (greenCorrect > 0){
                        user.greenCorrect += greenCorrect;
                    }
                    if (blueCorrect > 0){
                        user.blueCorrect += blueCorrect;
                    }
                    if (purpleCorrect > 0){
                        user.purpleCorrect += purpleCorrect;
                    }
                    if (answerCorrect > 0){
                        user.answerCorrect += answerCorrect;
                    }
                    if (answerIncorrect > 0){
                        user.answerIncorrect += answerIncorrect;
                    }
                    if (win > 0){
                        user.win += win;
                    }
                    if (loss > 0){
                        user.loss += loss;
                    }
                }
            }
            if (userExists === false){
                users.push({
                    name: author, 
                    connections: 1, 
                    yellowCorrect: yellowCorrect,
                    greenCorrect: greenCorrect,
                    blueCorrect: blueCorrect,
                    purpleCorrect: purpleCorrect,
                    answerCorrect: answerCorrect,
                    answerIncorrect: answerIncorrect,
                    win: win,
                    loss: loss,
                    winRate: 0,
                    correctAnswerRate: 0    
                });
            }
        }
    }
}

//command handler
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    if (connectionsChannel === null){
        await interaction.reply({
            content: ">>> Connections channel not found create a channel called 'connections-🟨🟩🟦🟪' and try again.",
            ephemeral: true,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            style: 4,
                            label: "Close",
                            custom_id: "close",
                        },
                    ],
                },
            ],
        });
        return;
    }

    if (interaction.commandName === "top") {
        //reply to the user and then deletes it
        await interaction.reply({
            content: "The top 10 users are being collected! Please wait a moment...",
            ephemeral: true
        });

        //collects the data
        await collectData();

        users.sort((a, b) => b[interaction.options.data[0].value] - a[interaction.options.data[0].value]);

        //figures out win rate and correct answer rate since win rate is win / (win + loss) and correct answer rate is correctAnswers / (correctAnswers + incorrectAnswers)
        if (interaction.options.data[0].value === "winRate"){
            for (let user of users){
                user.winRate = (user.win / (user.win + user.loss)) * 100;
            }
            users.sort((a, b) => b.winRate - a.winRate);
        }
        else if (interaction.options.data[0].value === "correctAnswerRate"){
            for (let user of users){
                user.correctAnswerRate = (user.answerCorrect / (user.answerCorrect + user.answerIncorrect)) * 100;
            }
            users.sort((a, b) => b.correctAnswerRate - a.correctAnswerRate);
        }

        //creates a string of the top 10 users make sure to round the win rate and correct answer rate to 2 decimal places
        var topUsers = "";
        for (let i = 0; i < 10; i++){
            if (users[i] !== undefined){
                if (interaction.options.data[0].value === "winRate"){
                    topUsers += (i + 1) + ". " + users[i].name + " - " + users[i].winRate.toFixed(2) + "%\n";
                }
                else if (interaction.options.data[0].value === "correctAnswerRate"){
                    topUsers += (i + 1) + ". " + users[i].name + " - " + users[i].correctAnswerRate.toFixed(2) + "%\n";
                }
                else {
                    topUsers += (i + 1) + ". " + users[i].name + " - " + users[i][interaction.options.data[0].value] + "\n";
                }
            }
        }

        //creates a var to create correct text on what the stat is
        var stat = "";
        if (interaction.options.data[0].value === "winRate"){
            stat = "Win Rate";
        }
        else if (interaction.options.data[0].value === "answerCorrect"){
            stat = "Correct Answers";
        }
        else if (interaction.options.data[0].value === "correctAnswerRate"){
            stat = "Correct Answer Rate";
        }
        else if (interaction.options.data[0].value === "yellowCorrect"){
            stat = "Yellow Correct";
        }
        else if (interaction.options.data[0].value === "greenCorrect"){
            stat = "Green Correct";
        }
        else if (interaction.options.data[0].value === "blueCorrect"){
            stat = "Blue Correct";
        }
        else if (interaction.options.data[0].value === "purpleCorrect"){
            stat = "Purple Correct";
        }
        else if (interaction.options.data[0].value === "answerIncorrect"){
            stat = "Incorrect Answers";
        }
        else if (interaction.options.data[0].value === "loss"){
            stat = "Loss";
        }
        
        //deletes old reply
        await interaction.deleteReply();

        //displays the top 10 users for the user that used the command
        await interaction.channel.send({
            content: ">>> **__Top 10 Users by " + stat + "__**\n" + topUsers,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            style: 4,
                            label: "Close",
                            custom_id: "closetop",
                        },
                    ],
                },
            ],
        });
    }

    if (interaction.commandName === "stats") {
        await interaction.reply({
            content: "The stats are being collected! Please wait a moment...",
            ephemeral: true
        });

        await collectData();

        for (let i = 0; i < users.length; i++){
            if (users[i].name === interaction.user.displayName){
                currentUser = i;
            }
        }

        //if the option is used, find the user in the array and display their stats
        if (interaction.options.data.length > 0){
            userNotFound = true;
            for (let i = 0; i < users.length; i++){
                if (users[i].name === interaction.options.data[0].user.displayName){
                    currentUser = i;
                    userNotFound = false;
                    //stops the loop
                    i = users.length;
                }
            }
            if (userNotFound === true){
                await interaction.editReply({
                    content: ">>> User not found",
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2,
                                    style: 4,
                                    label: "Close",
                                    custom_id: "close",
                                },
                            ],
                        },
                    ],
                });
            }
        }        

        //edits the reply to the command with the stats of the user ONLY IF USER IS FOUND
        if (userNotFound === false) {
            await interaction.editReply({
                content:
                ">>> **__Stats for " + users[currentUser].name + 
                "__**:\nNumber of Connections Played: " + users[currentUser].connections + 
                "\nwin: " + users[currentUser].win +
                "\nloss: " + users[currentUser].loss +
                "\nwin rate: " + ((users[currentUser].win / (users[currentUser].win + users[currentUser].loss)) * 100).toFixed(2) + "%" +
                "\nCorrect Answers: " + users[currentUser].answerCorrect + 
                "\nIncorrect Answers: " + users[currentUser].answerIncorrect + 
                "\nCorrect Answer Rate: " + ((users[currentUser].answerCorrect / (users[currentUser].answerCorrect + users[currentUser].answerIncorrect)) * 100).toFixed(2) + "%" +
                "\n🟨 Correct: " + users[currentUser].yellowCorrect + 
                "\n🟩 Correct: " + users[currentUser].greenCorrect + 
                "\n🟦 Correct: " + users[currentUser].blueCorrect + 
                "\n🟪 Correct: " + users[currentUser].purpleCorrect,
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                style: 1,
                                label: "Previous",
                                custom_id: "previous",
                            },
                            {
                                type: 2,
                                style: 1,
                                label: "Next",
                                custom_id: "next",
                            },
                            {
                                type: 2,
                                style: 4,
                                label: "Close",
                                custom_id: "close",
                            },
                        ],
                    },
                ],
            });
        }
    }
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    //checks if the button is the "previous" button
    if (interaction.customId === "previous") {
        if (currentUser === 0){
            currentUser = users.length - 1;
        }
        else {
            currentUser--;
        }
    }
    //checks if the button is the "next" button
    else if (interaction.customId === "next") {
        if (currentUser === users.length - 1){
            currentUser = 0;
        }
        else {
            currentUser++;
        }
    }

    //checks if the button is the "close" button and if so deletes the message
    if (interaction.customId === "close") {
        await interaction.update({
            content: "closing...",
        });
        await interaction.deleteReply();
        return;
    }

    if (interaction.customId === "closetop") {
        await interaction.message.delete();
        return;
    }
    
    //updates the message with the new user's stats
    await interaction.update({
        content:
            ">>> **__Stats for " + users[currentUser].name + 
            "__**:\nNumber of Connections Played: " + users[currentUser].connections + 
            "\nwin: " + users[currentUser].win +
            "\nloss: " + users[currentUser].loss +
            "\nwin rate: " + ((users[currentUser].win / (users[currentUser].win + users[currentUser].loss)) * 100).toFixed(2) + "%" +
            "\nCorrect Answers: " + users[currentUser].answerCorrect + 
            "\nIncorrect Answers: " + users[currentUser].answerIncorrect + 
            "\nCorrect Answer Rate: " + ((users[currentUser].answerCorrect / (users[currentUser].answerCorrect + users[currentUser].answerIncorrect)) * 100).toFixed(2) + "%" +
            "\n🟨 Correct: " + users[currentUser].yellowCorrect + 
            "\n🟩 Correct: " + users[currentUser].greenCorrect + 
            "\n🟦 Correct: " + users[currentUser].blueCorrect + 
            "\n🟪 Correct: " + users[currentUser].purpleCorrect,
    });
});