// commands.js

export const statsCommand = {
  name: "stats",
  description: "Collect Connections data from the Connections-channel and display it",
  options: [
    {
      name: "user",
      description: "The user you want to get the stats for",
      type: 6,
    },
  ],
};

//creates a /top command to show a leaderboard of the top 10 users, has a mantatory option drop down to choose between what top stat you want to show (win rate, correct answers, etc.)
export const topCommand = {
    name: "top",
    description: "Shows the top 10 users of the statistic you choose",
    options: [
        {
            name: "stat",
            description: "The stat you want to see the top 10 users",
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
