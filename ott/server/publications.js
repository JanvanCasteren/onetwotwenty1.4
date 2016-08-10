Meteor.publish("levels", function (level) {
  if(typeof level === 'undefined') {
    return Levels.find();
  }
  else {
    return Levels.find({name: level});
  }
});

Meteor.publish("sums", function (level) {
  return Sums.find({levels: { $in: [level] }});
});

