Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading'
});

Router.route('/', {
  name: 'levels',
  waitOn: function () {
    return Meteor.subscribe('levels');
  }
});

Router.route('/level', {
  name: 'level',
  waitOn: function () {
    return Meteor.subscribe('sums', Session.get('currentLevel'));
  }
});
//TODO: flowrouter met actions gebruiken
Router.route('/sum', {
  name: 'sum',
  waitOn: function () {
    SumStore.reset();
    var level = Session.get('currentLevel');
    console.log(level);
    return [
      Meteor.subscribe('sums', level),
      Meteor.subscribe('levels', level)
    ]
  }
});

