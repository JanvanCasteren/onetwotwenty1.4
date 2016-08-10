sumStore = function () {
    var self = this,
        sumVar = new ReactiveVar(),
        levelVar = new ReactiveVar(),
        stateVar = new ReactiveVar(false),
    //isRetry becomes true when the user gets
    //an (immediate) second try on a sum that
    //was made falsely
        isRetry = new ReactiveVar(false),
        lastGivenAnswerIsCorrect = true,
        incorrectSums = [],
    //needed for tracking the time the user needs
    //to answer the question
        reactionTime = 0,
        timeStart = 0,
    //gathers the digits the user enters
        digits = []
        ;

    //GETTERS
    self.getSum = function () {
        return sumVar.get();
    };
    self.getLevel = function () {
        return levelVar.get();
    };
    self.getState = function () {
        return stateVar.get();
    };
    self.getEnteredAnswer = function () {
        return enteredAnswer;
    };
    self.isRetry = function () {
        return isRetry.get();
    };
    self.getLastGivenAnswerIsCorrect = function () {
        return lastGivenAnswerIsCorrect;
    };
    self.getAnswer = function () {
        return digits.join('');
    };

    //PUBLIC METHODS (for testing purpose only)
    self.reset = function () {
        sumVar = new ReactiveVar();
        levelVar = new ReactiveVar();
        stateVar = new ReactiveVar(false);
        previousAnswer = new ReactiveVar(false);
        enteredAnswer = '';
        incorrectSums = [];
        reactionTime = 0;
        timeStart = 0;
        digits = [];
    };

    self.setLevel = function (levelName) {
        levelVar.set(Levels.find({name: levelName}).fetch()[0]);
    };

    self.setSum = function (sum) {
        sumVar.set(Sums.find({sum: sum}).fetch()[0]);
    };

    self.setState = function (state) {
        stateVar.set(state);
    };

    //END PUBLIC METHODS

    //REGISTER ACTIONS
    self.tokenId = Dispatcher.register(function (action) {
        var state = stateVar.get()
            ;

        switch (action.type) {
            case SumActions.SUM_START:
                initData();
                break;
            case SumActions.USER_ENTERED_DIGIT:
                //fired when user hits a digit key on the keyboard
                if ([SumStates.READY,
                        SumStates.ANSWERED_INCOMPLETE
                    ].indexOf(state) !== -1) {
                    handleDigitEntry(action.digit, action.time);
                }
                break;
            case SumActions.USER_HIT_ANSWER_BUTTON:
                //fired when user hit a button on the
                ///on-screen button pad
                if ([SumStates.READY,
                        SumStates.ANSWERED_INCOMPLETE
                    ].indexOf(state) !== -1) {
                    handleAnswerButtonEntry(action.buttonContent, action.time);
                }
                break;
            case SumActions.USER_CHOOSED_NEXT:
                if ([false,
                        SumStates.ANSWERED_FALSE,
                        SumStates.ANSWERED_CORRECT
                    ].indexOf(state) !== -1) {
                    nextSum();
                }
                break;
        }
    });

    //ACTION HANDLERS
    var initData = function () {
        self.reset();
        var levelName = Session.get('currentLevel');
        console.log(levelName);
        var level = Levels.find({name: levelName}).fetch()[0];
        levelVar.set(level);
    };

    var handleAnswerButtonEntry = function (buttonContent, time) {
        check(parseInt(buttonContent), Number);
        check(time, Number);
        var sum = sumVar.get(),
            state = stateVar.get(),
            expectedAnswer = sum.answer.toString()
            ;

        if ([SumStates.READY,
                SumStates.ANSWERED_INCOMPLETE
            ].indexOf(state) === -1) {
            return;
        }

        if (buttonContent.length < expectedAnswer.length) {
            handleDigitEntry(parseInt(buttonContent), time);
        } else {
            reactionTime = time - timeStart;
            handleAnswer(buttonContent);
        }

    };

    var handleDigitEntry = function (digit, time) {
        check(digit, Number);
        check(time, Number);
        var sum = sumVar.get(),
            state = stateVar.get(),
            expectedAnswer = sum.answer.toString(),
            answer
            ;

        if ([SumStates.READY,
                SumStates.ANSWERED_INCOMPLETE
            ].indexOf(state) === -1) {
            return;
        }

        digits.push(digit);

        //record the reactiontime when the first
        //digits is entered
        if (digits.length === 1) {
            reactionTime = time - timeStart;
        }

        if (digits.length !== expectedAnswer.length) {
            state = SumStates.ANSWERED_INCOMPLETE;
            enteredAnswer = digits.join('');
            //update state
            stateVar.set(state);
        }
        else {
            //answer has correct amount of digits,
            //so we don't need to wait longer
            answer = digits.join('');
            handleAnswer(answer);
        }
    };

    var handleAnswer = function (answerStr) {
        var sum = sumVar.get(),
            state = stateVar.get(),
            answer = parseInt(answerStr)
            ;

        enteredAnswer = answerStr;
        sum.givenAnswer = answer;
        if (lastGivenAnswerIsCorrect) {
            sum.handleAnswer(answer, reactionTime);
        }
        if (answer === sum.answer) {
            state = SumStates.ANSWERED_CORRECT;
            lastGivenAnswerIsCorrect = true;
            //show next sum automatically after timeout
            //do for instance 10 in a row
        }
        else {
            state = SumStates.ANSWERED_FALSE;
            lastGivenAnswerIsCorrect = false;
        }

        //update the reactive vars
        stateVar.set(state);
    };

    var nextSum = function () {
        var level = levelVar.get(),
            state = stateVar.get(),
            sumId
            ;

        if (state === SumStates.ANSWERED_INCOMPLETE) {
            //keep waiting for next input
            return;
        }

        if (state === SumStates.ANSWERED_FALSE) {
            isRetry.set(true);
        } else {
            isRetry.set(false);
        }

        //set begintime, so we can track the time passed when the user
        //answers
        timeStart = Date.now();
        digits = [];

        if (lastGivenAnswerIsCorrect) {

            sumId = level.getNextSum();
            console.log(level);
            console.log(sumId);
            if (sumId !== null) {
                sumVar.set(Sums.findOne(sumId));
            } else {
                //show popup and return to home
                Session.set('popup', {
                    show: true,
                    text: 'Je hoeft nu niet verder te oefenen met de ' + level.label,
                    route: '/'  //route to follow when popup is closed
                });
            }
        }

        if(sumId !== null) {
            stateVar.set(SumStates.READY);
        }

    }

};

SumStore = new sumStore();





