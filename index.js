import dotenv from 'dotenv';
dotenv.config();

import { CategoryChannel, Client, GatewayIntentBits, Guild, Message, SlashCommandBuilder } from 'discord.js';

import { DiscordInteractions } from "slash-commands";

// Create a new client instance and sets the intents to the ones we need
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
// create a array of objects to store the data for each user
var users = [];
var currentUser = 0;

// Log in to Discord with your app's token
client.login(process.env.DISCORD_TOKEN);

// When the client is ready, sends a message to the console
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

// Set up the slash commands
const interactions = new DiscordInteractions({
    applicationId: process.env.APPLICATION_ID,
    authToken: process.env.DISCORD_TOKEN,
    publicKey: process.env.PUBLIC_KEY,
});

// Create a new slash command called "Stats"
const command = {
    name: "stats",
    description: "Collect Connections data from the connections channel and displys it"
};

// Register the command
await interactions.createApplicationCommand(command)

// Activates when bot receives an the command
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === "stats") {
        await interaction.reply({
            content: "Your stats are being collected! Please wait a moment...",
            ephemeral: true
        });

        //reset the users array
        users = [];

        // Get all the messages in the connections channel
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

                //initialize the counters for each color and the correct and incorrect answers
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
                        loss: loss    
                    });
                }
            }
        }
        //delete the original reply
        await interaction.deleteReply();

        //Display basic stats for current user and has buttons to switch between users
        //finds where the user is in the array and displays their stats
        for (let i = 0; i < users.length; i++){
            if (users[i].name === interaction.user.displayName){
                currentUser = i;
            }
        }
        await interaction.channel.send({
            content:
            ">>> **__Stats for " + users[currentUser].name + 
            "__**:\nNumber of Connections Played: " + users[currentUser].connections + 
            "\nwin: " + users[currentUser].win +
            "\nloss: " + users[currentUser].loss +
            "\nwin rate: " + (users[currentUser].win / (users[currentUser].win + users[currentUser].loss)) * 100 + "%" +
            "\nCorrect Answers: " + users[currentUser].answerCorrect + 
            "\nIncorrect Answers: " + users[currentUser].answerIncorrect + 
            "\nCorrect Answer Rate: " + (users[currentUser].answerCorrect / (users[currentUser].answerCorrect + users[currentUser].answerIncorrect)) * 100 + "%" +
            "\nYellow Correct: " + users[currentUser].yellowCorrect + 
            "\nGreen Correct: " + users[currentUser].greenCorrect + 
            "\nBlue Correct: " + users[currentUser].blueCorrect + 
            "\nPurple Correct: " + users[currentUser].purpleCorrect,
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
});

// Activates when a button is clicked
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

    //updates the message with the new user's stats
    await interaction.update({
        content:
            ">>> **__Stats for " + users[currentUser].name + 
            "__**:\nNumber of Connections Played: " + users[currentUser].connections + 
            "\nwin: " + users[currentUser].win +
            "\nloss: " + users[currentUser].loss +
            "\nwin rate: " + (users[currentUser].win / (users[currentUser].win + users[currentUser].loss)) * 100 + "%" +
            "\nCorrect Answers: " + users[currentUser].answerCorrect + 
            "\nIncorrect Answers: " + users[currentUser].answerIncorrect + 
            "\nCorrect Answer Rate: " + (users[currentUser].answerCorrect / (users[currentUser].answerCorrect + users[currentUser].answerIncorrect)) * 100 + "%" +
            "\nYellow Correct: " + users[currentUser].yellowCorrect + 
            "\nGreen Correct: " + users[currentUser].greenCorrect + 
            "\nBlue Correct: " + users[currentUser].blueCorrect + 
            "\nPurple Correct: " + users[currentUser].purpleCorrect,
    });

    //checks if the button is the "close" button and if so deletes the message
    if (interaction.customId === "close") {
        await interaction.deleteReply();
    }
});

