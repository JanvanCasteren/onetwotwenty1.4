Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading'
});

Router.route('/login', {
    name: 'login',
    waitOn: function () {
        return Meteor.subscribe('levels');
    }
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
        if (Session.get('currentLevelType') === 'test') {
            return Meteor.subscribe('testsums', Session.get('currentLevel'));
        } else {
            return Meteor.subscribe('sums', Session.get('currentLevel'));
        }
    }
});
//TODO: flowrouter met actions gebruiken
Router.route('/sum', {
    name: 'sum',
    layoutTemplate: 'layout_no_scroll',
    waitOn: function () {
        var level = Session.get('currentLevel');
        if (Session.get('currentLevelType') === 'test') {
            return [
                Meteor.subscribe('testsums', level),
                Meteor.subscribe('levels', level)
            ];
        } else {
            return [
                Meteor.subscribe('sums', level),
                Meteor.subscribe('levels', level)
            ];
        }
    }
});

Router.route('/test', {
    name: 'testtableshelp'
});


