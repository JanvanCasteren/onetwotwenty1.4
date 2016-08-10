var sortObjects = {
    sumUp: {orderNumber: 1, score: -1},
    sumDown: {orderNumber: -1, score: 1},
    timeUp: {minReactionTime: 1, orderNumber: 1},
    timeDown: {minReactionTime: -1, orderNumber: 1},
    scoreUp: {score: 1, orderNumber: 1},
    scoreDown: {score: -1, orderNumber: 1}
};

Template.level.onCreated(function () {
    this.state = new ReactiveDict();
    this.state.setDefault({
        sortOrder: 'scoreUp'
    });
});

Template.level.helpers({

    sums: function () {
        var sortOrder = Template.instance().state.get('sortOrder');
        // this helper returns a cursor of
        // all of the posts in the collection
        if (Session.get('currentLevelType') === 'test') {
            return Testsums.find({}, {sort: sortObjects[sortOrder]});
        } else {
            return Sums.find({}, {sort: sortObjects[sortOrder]});
        }
    },

    isSortOrder: function(sortOrder) {
        return Template.instance().state.get('sortOrder') === sortOrder;
    },

    time: function(minReactionTime) {
        if(minReactionTime === 0) {
            return '';
        } else {
            var time = minReactionTime/1000;
            return time.toFixed(1);
        }
    },

    stars: function (score) {
        // var score = 3;
        switch (score) {
            case 0:
                return [
                    {type: 'starEmpty'},
                    {type: 'starEmpty'},
                    {type: 'starEmpty'}
                ];
            case 1:
                return [
                    {type: 'starHalf'},
                    {type: 'starEmpty'},
                    {type: 'starEmpty'}
                ];
            case 2:
                return [
                    {type: 'starFull'},
                    {type: 'starEmpty'},
                    {type: 'starEmpty'}
                ];
            case 3:
                return [
                    {type: 'starFull'},
                    {type: 'starHalf'},
                    {type: 'starEmpty'}
                ];
            case 4:
                return [
                    {type: 'starFull'},
                    {type: 'starFull'},
                    {type: 'starEmpty'}
                ];
            case 5:
                return [
                    {type: 'starFull'},
                    {type: 'starFull'},
                    {type: 'starHalf'}
                ];
            case 6:
                return [
                    {type: 'starFull'},
                    {type: 'starFull'},
                    {type: 'starFull'}
                ];
            default:
                return [
                    {type: 'starEmpty'},
                    {type: 'starEmpty'},
                    {type: 'starEmpty'}
                ];
        }
    }
});

//the keydown event must be on the documents body
Template.level.events({

    'click .level-header-sum': function (event, instance) {
        if (instance.state.get('sortOrder') === 'sumUp') {
            instance.state.set('sortOrder', 'sumDown');
        } else {
            instance.state.set('sortOrder', 'sumUp');
        }
    },

    'click .level-header-time': function (event, instance) {
        if (instance.state.get('sortOrder') === 'timeUp') {
            instance.state.set('sortOrder', 'timeDown');
        } else {
            instance.state.set('sortOrder', 'timeUp');
        }
    },

    'click .level-header-score': function (event, instance) {
        if (instance.state.get('sortOrder') === 'scoreUp') {
            instance.state.set('sortOrder', 'scoreDown');
        } else {
            instance.state.set('sortOrder', 'scoreUp');
        }
    }

});