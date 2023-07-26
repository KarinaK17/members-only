#! /usr/bin/env node

console.log("This script populates some test users and messages");

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const User = require("./models/user");
const Message = require("./models/message");

const users = [];
const messages = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");

  await createUsers();
  await createMessages();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

async function userCreate(
  index,
  first_name,
  last_name,
  username,
  password,
  membership_status,
  admin
) {
  const user = new User({
    first_name: first_name,
    last_name: last_name,
    username: username,
    password: password,
    membership_status: membership_status,
    admin: admin,
  });
  await user.save();
  users[index] = user;
  console.log(`Added user: ${first_name}`);
}

async function messageCreate(index, title, text, author) {
  const user = new Message({
    title: title,
    text: text,
    author: author,
  });

  await user.save();
  users[index] = user;
  console.log(`Added  message: ${title} ${author}`);
}

async function createUsers() {
  console.log("Adding users");
  await Promise.all([
    userCreate(0, "John", "Smith", "john5@gmail.com", "12345678", true, true),
    userCreate(1, "Mary", "Smith", "mary5@gmail.com", "45678910", false, false),
  ]);
}

async function createMessages() {
  console.log("Adding messages");
  await Promise.all([
    messageCreate(0, "Greeting", "Hello!", users[0]),
    messageCreate(1, "Greeting", "Hi!", users[1]),
    messageCreate(2, "Question", "how are you?", users[0]),
    messageCreate(0, "Answer", "I'm fine, thanks.", users[1]),
  ]);
}

console.log(messages);
