const mongoose = require('mongoose');
require('dotenv').config();
const Team = require('../models/Team');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:hudafestadmin123@cluster0.zb2c00b.mongodb.net/hudafestival?retryWrites=true&w=majority&appName=Cluster0";

const updates = {
  "TEAM A": "Bastille",
  "TEAM B": "Syntagma",
  "TEAM C": "Tahrir",
  "TEAM D": "Tiananmen"
};

async function renameTeams() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    const teams = await Team.find({});
    console.log(`Found ${teams.length} teams in the database.`);

    for (const team of teams) {
      if (updates[team.name]) {
        const oldName = team.name;
        const newName = updates[team.name];
        team.name = newName;
        await team.save();
        console.log(`Renamed team: "${oldName}" -> "${newName}" (ID: ${team._id})`);
      } else {
        console.log(`Skipped team: "${team.name}" (No rename mapping or already renamed)`);
      }
    }

    console.log('Team renaming complete.');
  } catch (error) {
    console.error('Error renaming teams:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

renameTeams();
