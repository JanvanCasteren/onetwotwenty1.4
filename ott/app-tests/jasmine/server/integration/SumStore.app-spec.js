describe('SumStore', function () {
    "use strict";

    beforeEach(function() {

    });

    it('SumStore should be created', function () {
        expect(SumStore instanceof sumStore).toBe(true);
    });

    describe('on initialisation', function () {

        it('should choose a level when initialised', function() {
            Dispatcher.dispatch(SumActions.SUM_START);
            expect(SumStore.getLevel() instanceof Level).toBe(true);
        });

        it('should choose a sum on NEXT', function() {
            Dispatcher.dispatch(SumActions.USER_CHOOSED_NEXT);
            expect(SumStore.getSum() instanceof Sum).toBe(true);
        });
        
    });


    describe('when user handles the sum 7x5', function () {

        beforeEach(function() {
            SumStore.reset();
            SumStore.setLevel('multiplicationColumnFive');
            SumStore.setSum('7*5');
        });

        it('should have the level set', function () {
            expect(SumStore.getLevel().name).toBe('multiplicationColumnFive');
        });

        it('should have the sum set', function () {
            expect(SumStore.getSum().sum).toBe('7*5');
        });

        it('should set state to ANSWERED_INCOMPLETE after user enters the first answer digit', function () {
            SumStore.setState(SumStates.READY);
            Dispatcher.dispatch(SumActions.USER_ENTERED_DIGIT, {
                digit: 3,
                time: Date.now()
            });

            expect(SumStore.getState()).toBe(SumStates.ANSWERED_INCOMPLETE);
        });

        it('should set state to ANSWERED_CORRECT after user enters the second answer digit and the answer is correct', function () {
            SumStore.setState(SumStates.READY);
            Dispatcher.dispatch(SumActions.USER_ENTERED_DIGIT, {
                digit: 3,
                time: Date.now()
            });
            Dispatcher.dispatch(SumActions.USER_ENTERED_DIGIT, {
                digit: 5,
                time: Date.now()
            });

            expect(SumStore.getState()).toBe(SumStates.ANSWERED_CORRECT);
        });

        it('should set state to ANSWERED_FALSE after user enters the second answer digit and the answer is false', function () {
            SumStore.setState(SumStates.READY);
            Dispatcher.dispatch(SumActions.USER_ENTERED_DIGIT, {
                digit: 3,
                time: Date.now()
            });
            Dispatcher.dispatch(SumActions.USER_ENTERED_DIGIT, {
                digit: 6,
                time: Date.now()
            });

            expect(SumStore.getState()).toBe(SumStates.ANSWERED_FALSE);
        });

        it('should set state to ANSWERED_CORRECT after user enters a complete answer through the button pad and the answer is correct', function () {
            SumStore.setState(SumStates.READY);
            Dispatcher.dispatch(SumActions.USER_HIT_ANSWER_BUTTON, {
                buttonContent: '35',
                time: Date.now()
            });

            expect(SumStore.getState()).toBe(SumStates.ANSWERED_CORRECT);
        });

        it('should set state to ANSWERED_FALSE after user enters a complete answer through the button pad and the answer is false', function () {
            SumStore.setState(SumStates.READY);
            Dispatcher.dispatch(SumActions.USER_HIT_ANSWER_BUTTON, {
                buttonContent: '36',
                time: Date.now()
            });

            expect(SumStore.getState()).toBe(SumStates.ANSWERED_FALSE);
        });



    });

});