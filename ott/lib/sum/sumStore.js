sumStore = function () {
    var self = this,
        sumVar,
        levelVar,
        stateVar,
        helpStateVar,
        helpToPhaseOneTimeOut,
    //isRetry becomes true when the user gets
    //an (immediate) second try on a sum that
    //was made falsely
        isRetry,
        lastGivenAnswerIsCorrect,
        incorrectSums,
    //needed for tracking the time the user needs
    //to answer the question
        reactionTime,
        timeStart,
    //gathers the digits the user enters
        digits,
        //keeps the entered answer
        enteredAnswer
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
    self.getHelpState = function () {
        return helpStateVar.get();
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

    //PUBLIC METHODS //for testing purposes only

    self.init = function () {
        //initialisation
        sumVar = new ReactiveVar(false);
        levelVar = new ReactiveVar(false);
        stateVar = new ReactiveVar(false);
        helpStateVar =  new ReactiveVar(HelpStates.NO_HELP);
        if(helpToPhaseOneTimeOut) {
            clearTimeout(helpToPhaseOneTimeOut);
        }
        isRetry = new ReactiveVar(false);
        enteredAnswer = '';
        lastGivenAnswerIsCorrect = true;
        incorrectSums = [];
        reactionTime = 0;
        timeStart = 0;
        digits = [];
    };

    //first initalisation
    self.init();

    self.setLevel = function (levelName) {
        levelVar.set(Levels.find({name: levelName}).fetch()[0]);
    };

    self.setSum = function (sum) {
        var level = levelVar.get();
        if (level.type === 'test') {
            sumVar.set(Testsums.find({sum: sum}).fetch()[0]);
        } else {
            sumVar.set(Sums.find({sum: sum}).fetch()[0]);
        }
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
            case SumActions.USER_HIT_BACKSPACE:
                console.log(state);
                if(state === SumStates.ANSWERED_INCOMPLETE) {
                    removeLastDigit();
                }
                console.log('backspace ');
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
        self.init();
        var levelName = Session.get('currentLevel');
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

        if(helpToPhaseOneTimeOut) {
            clearTimeout(helpToPhaseOneTimeOut);
        }

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

    var removeLastDigit = function() {
        var state = stateVar.get();
        digits.pop();
        enteredAnswer = digits.join('');
        state = SumStates.READY;
        stateVar.set(state);
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
            if(helpToPhaseOneTimeOut) {
                clearTimeout(helpToPhaseOneTimeOut);
            }
            //show next sum automatically after timeout
            //do for instance 10 in a row
        }
        else {
            state = SumStates.ANSWERED_FALSE;
            lastGivenAnswerIsCorrect = false;
            //set correct helpphase
            if(helpStateVar.get() === HelpStates.PHASE_ONE) {
                helpStateVar.set(HelpStates.PHASE_TWO);
            } else {
                helpStateVar.set(HelpStates.PHASE_ONE);
            }
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
            helpStateVar.set(HelpStates.NO_HELP);
            //shift help state to fase one if user does not
            //answer within four seconds
            if(helpToPhaseOneTimeOut) {
                clearTimeout(helpToPhaseOneTimeOut);
            }
            helpToPhaseOneTimeOut = setTimeout(function() {
                helpStateVar.set(HelpStates.PHASE_ONE);
            }, SumScoreTimes.SHOWHELP);
        }

        //set begintime, so we can track the time passed when the user
        //answers
        timeStart = Date.now();
        digits = [];

        if (lastGivenAnswerIsCorrect) {
            sumId = level.getNextSum();
            if (sumId !== null) {
                if (level.type === 'test') {
                    sumVar.set(Testsums.findOne(sumId));
                } else {
                    sumVar.set(Sums.findOne(sumId));
                }
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





