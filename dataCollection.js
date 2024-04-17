import { database } from "./database.js";

// data collection function
export async function collectData(connectionsChannel) {
    var users = [];
    // loop through all messages in a channel
    let messages = await connectionsChannel.messages.fetch({ limit: 100 });
    while (messages.size > 0) {
        for (let [, message] of messages){
            const splitMessage = message.content.split(" ");
            if (splitMessage[0] === "Connections"){
                //gets the username of the author of the message
                const author = message.author.displayName;
                //splits the NumberAndPuzzel into two parts and gets the number
                const NumberAndPuzzel = splitMessage[2];
                var splitNumberAndPuzzel = NumberAndPuzzel.split("");
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
        messages = await connectionsChannel.messages.fetch({ limit: 100, before: messages.last().id });
    }
    
    // return the data
    return users;
}