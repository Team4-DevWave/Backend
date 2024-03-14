const mongoose = require('mongoose');
const reportSchema =new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  title: {type: String, required: true},
  description: {type: String, required: true},
  type: {
    type: String,
    enum: [
      'Break rules',
      'Harassment',
      'Threatening violence',
      'Hate',
      'Minor abuse or sexualization',
      'Sharing personal information',
      'Non-consensual intimate media',
      'Prohibited transaction',
      'Impersonation',
      'Copyright violation',
      'Trademark violation',
      'Self-harm or suicide',
      'Spam',
    ],
    required: true,
  },
});

const reportModel = mongoose.model('reports', reportSchema);
module.exports = reportModel;
