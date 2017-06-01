//refresh the session vars for this page when we
//switch user
var refreshMyData = function() {
    Meteor.call('levels.getProgress', {}, (err, res) => {
        if (err) {
            console.error(err);
        } else {
            Session.set('levelScores', res);
        }
    });
    Meteor.call('levels.practiceNeeded', {}, (err, res) => {
        if (err) {
            console.error(err);
        } else {
            Session.set('levelsPracticeNeeded', res);
        }
    });
};

Meteor.autorun(function () {
    Meteor.userId(); //make this run when userId changes
    //in both cases (login or logout) do
    refreshMyData();
});


Template.levels.onCreated(function () {
    refreshMyData();
});

Template.levels.helpers({
    levels: function () {
        // this helper returns a cursor of
        // all of the posts in the collection
        return Levels.find({}, {sort: {orderNumber: 1}});
    },

    progressPercentage: function (levelName) {
        var percentage = 0;
        if(Session.get('levelScores')) {
            percentage = Session.get('levelScores')[levelName];
        }
        return percentage;
    },

    buttonClass: function(levelName) {
        var practiceNeeded = true;
        if(Session.get('levelsPracticeNeeded')) {
            practiceNeeded = Session.get('levelsPracticeNeeded')[levelName];
        }
        if(practiceNeeded) {
            return 'level-button-active';
        } else {
            return 'level-button-inactive';
        }
    }

});

Template.levels.events({
    "click .link-sumslist": function (event) {
        //set the correct level in the session before the link
        //will be followed
        var level = event.currentTarget.getAttribute('data-name');
        Session.set('currentLevel', level);
        var levelDoc = Levels.findOne({name: level});
        Session.set('currentLevelType', levelDoc.type);
        Router.go('/level');
    },
    "click .link-sum.level-button-active": function (event) {
        //show the next sum for this level
        var level = event.currentTarget.getAttribute('data-name');
        Session.set('currentLevel', level);
        var levelDoc = Levels.findOne({name: level});
        Session.set('currentLevelType', levelDoc.type);
        Router.go('/sum');
    },
    "click .link-sum.level-button-inactive": function (event) {
        //show popup and return to home
        Session.set('popup', {
            show: true,
            text: 'Je hoeft deze sommen nu niet te oefenen',
            route: ''
        });
    }

});