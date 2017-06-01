Meteor.publish("levels", function (level) {
  if(typeof level === 'undefined') {
    return Levels.find({userId: this.userId});
  }
  else {
    return Levels.find({name: level, userId: this.userId});
  }
});

Meteor.publish("sums", function (level) {
  return Sums.find({userId: this.userId, levels: { $in: [level] }});
});

Meteor.publish("testsums", function (level) {
  return Testsums.find({userId: this.userId, levels: { $in: [level] }});
});

