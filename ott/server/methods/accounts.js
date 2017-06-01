Accounts.onCreateUser(function(options, user) {
    //this runs synchronously
    Meteor.call('levels.initTableLevels', user._id);
    return user;
});

