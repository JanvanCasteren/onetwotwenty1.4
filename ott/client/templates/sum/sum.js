Template.sum.onCreated(function () {
    Dispatcher.dispatch(SumActions.SUM_START);

    //initialise helperConfig session Var
    Session.set('helperConfig', null);
});

Template.sum.helpers({

    question: function () {
        if (SumStore.getState()) {
            //the replace replace asterix by x for multiplication
            return SumStore.getSum().sum.replace('*', '\u00d7');
        }
        else {
            return '';
        }
    },

    /**
     * the =-sign must be visible all the time
     * except when the user didn't ask for the first
     * sum yet
     */
    showEqualSign: function () {
        return SumStore.getState() !== false;
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

    helpConfig: function () {
        var sum = SumStore.getSum()
            ;

        if (sum === false) {
            return false;
        }

        console.log(sum);

        return {
            answer: sum.answer,
            type: 'multiplication',
            //the step value is the part after
            //the asterix in the sum, eg
            //3 in 6*3
            step: parseInt(sum.sum.substr(sum.sum.indexOf('*') + 1, sum.sum.length))
        };
    },

    showNumberline: function() {
        return SumStore.getHelpState() !== HelpStates.NO_HELP;
    },

//returns the needed value for a button
//in the answer pad.
//default is 0-9, when child does not know the
//answer, the buttons get all the answer of
//the current multiplication column
    buttonValue: function (orderNr) {
        var sum = null,
            sumState = SumStore.getState();

        if (sumState) {
            sum = SumStore.getSum();
        }

        //if the user doesn't not manage to answer with the
        //numberline show, we give additional help by displaying
        //the answers
        //TODO: simplify if statement
        if (sumState && sum && SumStore.isRetry()
            && SumStore.getHelpState() === HelpStates.PHASE_TWO
            && sum.table !== false) {
            return sum.table * orderNr;
        } else {
            return orderNr;
        }
    }
    ,

    isCorrect: function () {
        return (SumStore.getState() === SumStates.ANSWERED_CORRECT);
    }
    ,

    isFalse: function () {
        return (SumStore.getState() === SumStates.ANSWERED_FALSE);
    },

    /**
     * Return the correct left position of the false marker,
     * based on the given answer
     */
    falseLeft: function() {
        var sum = SumStore.getSum();

        if(sum && sum.givenAnswer) {
            console.log(sum.givenAnswer)
            if(sum.givenAnswer < 10) {
                return '6vh';
            } else {
                return '-8.5vh';
            }
        } else {
            return '-6vh';
        }
    }
})
;


Template.sum.events({

    'click .sum-controls > div': function (event) {
        var buttonContent = event.currentTarget.innerHTML.trim();

        //check if user hit the back button
        if ($(event.currentTarget).data('button') === 'backspace') {
            //user pressed backspace key
            Dispatcher.dispatch(SumActions.USER_HIT_BACKSPACE);
            return;
        }

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

    'keydown': function (event) {

        if (event.keyCode === 8) {
            //user pressed backspace key
            Dispatcher.dispatch(SumActions.USER_HIT_BACKSPACE);
            //disable the browser back action
            event.preventDefault();
            return;
        }

        if (event.keyCode === 13) {
            //user pressed enter key, whitch indicates "next"
            Dispatcher.dispatch(SumActions.USER_CHOOSED_NEXT);
            return;
        }

        if ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].indexOf(parseInt(event.key) !== -1)) {
            //user pressed one of the digit keys
            Dispatcher.dispatch(SumActions.USER_ENTERED_DIGIT, {
                digit: parseInt(event.key),
                time: Date.now()
            });
        }


    }

});