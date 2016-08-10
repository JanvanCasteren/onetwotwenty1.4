Template.sum.onCreated(function () {
    Dispatcher.dispatch(SumActions.SUM_START);
});

Template.sum.helpers({

    question: function () {
        if (SumStore.getState()) {
            //the replace replace asterix by x for multiplication
            return SumStore.getSum().sum.replace('*', 'x');
        }
        else {
            return '';
        }
    },

    answer: function () {
        var sum = null,
            enteredAnswer = '',
            sumState = SumStore.getState();

        if (sumState) {
            sum = SumStore.getSum();
        }

        switch (sumState) {
            case SumStates.READY:
                return '_';
                break;
            case SumStates.ANSWERED_INCOMPLETE:
                enteredAnswer = SumStore.getEnteredAnswer();
                return enteredAnswer + '_';
                break;
            case SumStates.ANSWERED_CORRECT:
                return sum.givenAnswer;
                break;
            case SumStates.ANSWERED_FALSE:
                return sum.givenAnswer;
                break;
            default:
                return '';
        }
    },

    helpSectionClass: function () {
        if(SumStore.isRetry()) {
            return '';
        } else {
            return 'invisible';
        }
    },

    //returns the needed value for a button
    //in the answer pad.
    //default is 0-9, when child does not know the
    //answer, the buttons get all the answer of
    //the current multiplication column
    buttonValue: function(orderNr) {
        var sum = null,
            sumState = SumStore.getState();

        if (sumState) {
            sum = SumStore.getSum();
        }

        //if the previous answer was not correct, we want to
        //show the answers instead of the digits on the buttons
        if(sumState && sum && SumStore.isRetry()
            && sum.table !== false) {
            return sum.table * orderNr;
        } else {
            return orderNr;
        }
    },

    isCorrect: function () {
        return (SumStore.getState() === SumStates.ANSWERED_CORRECT);
    },

    isFalse: function () {
        return (SumStore.getState() === SumStates.ANSWERED_FALSE);
    }
});


Template.sum.events({

    'click .sum-controls > div': function (event) {
        var buttonContent = event.currentTarget.innerHTML.trim();
        //check if user hit the back button

        Dispatcher.dispatch(SumActions.USER_HIT_ANSWER_BUTTON, {
            buttonContent: buttonContent,
            time: Date.now()
        });
    },

    'click .sum-nav': function (event) {
        Dispatcher.dispatch(SumActions.USER_CHOOSED_NEXT);
    }

});

//the keydown event must be on the documents body
Template.body.events({

    'keydown': function(event) {

        if(event.keyCode === 13) {
            //user pressed enter key, whitch indicates "next"
            Dispatcher.dispatch(SumActions.USER_CHOOSED_NEXT);
            return;
        }

        if([0,1,2,3,4,5,6,7,8,9].indexOf(parseInt(event.key) !== -1)) {
            //user pressed one of the digit keys
            Dispatcher.dispatch(SumActions.USER_ENTERED_DIGIT, {
                digit: parseInt(event.key),
                time: Date.now()
            });
        }


    }

});