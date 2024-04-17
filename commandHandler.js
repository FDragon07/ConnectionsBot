//command handler

import { collectData } from "./dataCollection.js";
import { database } from "./database.js";

export const handleInteraction = async (interaction, client) => {
    virtual1(interaction, client);
};

const virtual1 = async (interaction, client) => {
    if (!interaction.isCommand()) return;

    const connectionsChannelId = await database.getConnectionsChannel(interaction.guildId);
    const connectionsChannel = interaction.guild.channels.cache.get(connectionsChannelId);
    if (connectionsChannel === null){
        await interaction.reply({
            content: "Connections channel not found create a channel that starts with 'connections' and try again.",
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
        await collectData(connectionsChannel);

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

        const users = await collectData(connectionsChannel);
        var currentUser = null;
        var userNotFound = true;

        for (let i = 0; i < users.length; i++){
            if (users[i].name === interaction.user.displayName){
                currentUser = i;
            }
        }

        //if the option is used, find the user in the array and display their stats
        if (interaction.options.data.length > 0){
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
            const virtual2 = async (interaction) => {
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
            };
            client.on("interactionCreate", virtual2);

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
};
