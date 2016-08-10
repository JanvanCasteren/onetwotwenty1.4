Template.levels.helpers({
  levels: function () {
    // this helper returns a cursor of
    // all of the posts in the collection
    return Levels.find();
  }
});

Template.levels.events({
  "click .link-sumslist": function (event) {
    //set the correct level in the session before the link
    //will be followed
    var level = event.currentTarget.getAttribute('data-name');
    Session.set('currentLevel', level);
    Router.go('/level');
  },
  "click .link-sum": function (event) {
    //show the next sum for this level
    var level = event.currentTarget.getAttribute('data-name');
    Session.set('currentLevel', level);
    Router.go('/sum');
  }
});