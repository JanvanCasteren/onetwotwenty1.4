Template.popup.onCreated(function () {
    Session.set('popup', {
        show: false,
        text: '',
        route: ''  //route to follow when popup is closed
    });
});

Template.popup.helpers({
    show: function () {
        return Session.get('popup').show;
    },

    text: function() {
        return Session.get('popup').text;
    }
});

Template.popup.events({
    'click': function (event) {
        var route = Session.get('popup').route;
        Session.set('popup', {
            show: false,
            text: '',
            route: ''
        });
        if(route) {
            Router.go(route);
        }
    }
});