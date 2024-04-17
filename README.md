# Connections Bot

A discord bot for analyzing the scores of the Connections game by NYT.

## Installation

To install the bot to your discord server, simply using [this link][0] or paste it below into your browser.

```
https://discord.com/oauth2/authorize?client_id=TODO&permissions=93264&scope=bot
```

## Development

Install all dependencies with the following command:

```bash
npm install
```

Create a Firebase app with [Google Firebase][1] and create a `.env` file in the root directory of the project. The `.env` file should contain the following:

```env
PUBLIC_KEY=<YOUR_PUBLIC_KEY>
APPLICATION_ID=<YOUR_APP_ID>
DISCORD_TOKEN=<YOUR_DISCORD_BOT_TOKEN>

FIREBASE_API_KEY=<YOUR_FIREBASE_API_KEY>
FIREBASE_AUTH_DOMAIN=<YOUR_FIREBASE>
FIREBASE_PROJECT_ID=<YOUR_FIREBASE_PROJECT_ID>
FIREBASE_STORAGE_BUCKET=<YOUR_FIREBASE>
FIREBASE_MESSAGING_SENDER_ID=<YOUR_FIREBASE>
FIREBASE_APP_ID=<YOUR_FIREBASE>
# Optionally add the following if you want to use Google Analytics
FIREBASE_MEASUREMENT_ID=<YOUR_FIREBASE>>
```

The Firebase configuration can be found in the Firebase console under the project settings.
See the [Firebase documentation][2] for more information.
The Discord token can be found in the Discord [developer portal][3].

To ensure the bot will have access to the firestore database, you will need to initialize and deploy the firebase app with the following code:

```bash
firebase init firestore
firebase deploy --only firestore
```

Enable authentication in the Firebase console.
The bot will use the email and password authentication method.
Then create a user using the `createUser` command. This will create a user with the given username and password.

```bash
npm run createUser {username} {password}
```

Then add the username and password to your `.env` file like so:
    
```env
FIREBASE_AUTH_EMAIL=<YOUR USERNAME>
FIREBASE_AUTH_PASSWORD=<YOUR PASSWORD>
```

Finally, run the bot with the following command:

```bash
npm run start
```

## Deployment

To deploy the bot, first ensure that the `.env` file is properly configured.
The best way to do this is to get a development environment working first.
Then create a new [Heroku][4] app and link it to your GitHub repository fork.
Finally, deploy the app to Heroku; either via the web interface or by pushing to GitHub.


[0]: https://discord.com/oauth2/authorize?client_id=TODO&permissions=93264&scope=bot
[1]: https://firebase.google.com/
[2]: https://support.google.com/firebase/answer/7015592#zippy=%2Cin-this-article
[3]: https://discord.com/developers/applications
[4]: https://www.heroku.com/
