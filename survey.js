const mongoose = require('mongoose');

// Create a schema for the Survey model
const surveySchema = new mongoose.Schema({
  age: Number,
  gender: String,
  // Define other fields as needed based on your survey data
});

// Create a model from the schema
const Survey = mongoose.model('Survey', surveySchema);

module.exports = Survey;
