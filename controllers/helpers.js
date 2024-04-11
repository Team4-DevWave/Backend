exports.populateAndExecute=async (query)=> {
  return await query.populate('userID', 'username').populate('subredditID', 'name').populate('parentPost').exec();
};
