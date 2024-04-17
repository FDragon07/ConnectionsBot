import { createUser } from './database.js';

const run = () => {
    if (process.argv.length < 4) {
        console.log("Usage: node createUser.js {username} {password}");
        process.exit(1);
    } else {
        const username = process.argv[2];
        const password = process.argv[3];
        createUser(username, password);
    }
};

run();
