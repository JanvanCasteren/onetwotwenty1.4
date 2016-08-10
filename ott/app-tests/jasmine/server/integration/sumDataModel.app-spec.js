describe("Sum", function () {
    "use strict";

    var sum;
    var answerObjFalse;
    var answerObjTrue;

    beforeEach(function () {
        var obj = {
            sum: '1+2',
            level: 'oneTwoTen',
            subLevel: 1
        };

        answerObjFalse = {
            reactionTime: 2345,
            isCorrect: false,
            timestamp: Date.now()
        };

        answerObjTrue = {
            reactionTime: 111,
            isCorrect: true,
            timestamp: Date.now()
        };

        sum = new Sum(obj);
    });

    it("should be created", function () {
        spyOn(Sums, "insert").and.callFake(function (doc, callback) {
            // simulate async return of id = "1";
            callback(null, "1");
        });

        var sumState = sum.getState();

        expect(sum.sum).toBe('1+2');
        expect(sum.answer).toBe(3);

        sum.save();

        // id should be defined
        expect(sum.id).toEqual("1");
        expect(Sums.insert).toHaveBeenCalledWith(sumState, jasmine.any(Function));
    });

    describe('getter table', function() {

        it('should return the correct table when the sum is a multiplication (and false otherwise', function () {
            sum._sum = '6*7';
            expect(sum.table).toEqual(7);
            sum._sum = '6+7';
            expect(sum.table).toEqual(false);
        });

    });

    describe('shouldBeIncluded', function () {

        it('should return true if the history contains zero entries', function () {
            expect(sum.shouldBeIncluded()).toBe(true);
        });

        it('should return true if the history contains just one entry', function () {
            sum._history.push(Object.assign({}, answerObjTrue));
            expect(sum.shouldBeIncluded()).toBe(true);
        });

        it('should return true if any of the two last answers was incorrect', function () {
            sum._history.push(Object.assign({}, answerObjFalse));
            sum._history.push(Object.assign({}, answerObjTrue));
            expect(sum.shouldBeIncluded()).toBe(true);
            sum._history.push(Object.assign({}, answerObjTrue));
            sum._history.push(Object.assign({}, answerObjFalse));
            expect(sum.shouldBeIncluded()).toBe(true);
        });

        it('should return true if both last two answers were correct and the forelast not in the last hour', function () {
            answerObjTrue.timestamp = answerObjTrue.timestamp - (3*3600*1000);
            sum._history.push(Object.assign({}, answerObjTrue));
            sum._history.push(Object.assign({}, answerObjTrue));
            expect(sum.shouldBeIncluded()).toBe(true);
        });

        it('should return false if both last two answers were correct and and the forelast in the last hour', function () {
            answerObjTrue.timestamp = answerObjTrue.timestamp - (1800*1000);
            sum._history.push(Object.assign({}, answerObjTrue));
            sum._history.push(Object.assign({}, answerObjTrue));
            expect(sum.shouldBeIncluded()).toBe(false);
        });

    });

    describe('lastWasCorrect', function () {

        it('should return true if history is empty', function () {
            expect(sum.lastWasCorrect()).toBe(true);
        });

        it('should return true if last of history was correct', function () {
            sum._history.push(Object.assign({}, answerObjTrue));
            expect(sum.lastWasCorrect()).toBe(true);
        });

        it('should return false if last of history was incorrect', function () {
            sum._history.push(Object.assign({}, answerObjFalse));
            expect(sum.lastWasCorrect()).toBe(false);
        });
    });

    describe("handleAnswer", function () {

        it('increments the correct property when answer is correct', function () {
            sum._correct = 12;
            sum.handleAnswer(3, 234);
            expect(sum._correct).toBe(13);
            sum.handleAnswer(5, 234);
            expect(sum._correct).toBe(13);
        });

        it('increments the incorrect property when answers is false', function () {
            sum._incorrect = 12;
            sum.handleAnswer(3, 234);
            expect(sum._incorrect).toBe(12);
            sum.handleAnswer(5, 234);
            expect(sum._incorrect).toBe(13);
        });

        it('calls the _computeAndSetReactionTime method once when an answer is correct', function () {
            spyOn(sum, "_computeAndSetReactionTime");
            sum.handleAnswer(3, 234);
            expect(sum._computeAndSetReactionTime).toHaveBeenCalled();
        });

        it('does NOT call the _computeAndSetReactionTime method when an answer is false', function () {
            spyOn(sum, "_computeAndSetReactionTime");
            sum.handleAnswer(4, 234);
            expect(sum._computeAndSetReactionTime).not.toHaveBeenCalled();
        });

        it('calls the _updateScoreBase method with the correct parameters', function () {
            spyOn(sum, "_updateScoreBase");
            sum.handleAnswer(3, 234);
            expect(sum._updateScoreBase).toHaveBeenCalledWith(234, true);
            sum.handleAnswer(5, 2334);
            expect(sum._updateScoreBase).toHaveBeenCalledWith(2334, false);
        });

    });

    describe('_getPreviousAnswer', function () {

        it('has a _getPreviousAnswer method which finds the last answer in the scoreBase', function () {

            sum._scoreBase.push(Object.assign({}, answerObjFalse));
            sum._scoreBase.push(Object.assign({}, answerObjTrue));
            var previousAnswer = sum._getPreviousAnswer();
            expect(previousAnswer.reactionTime).toEqual(Object.assign({}, answerObjTrue).reactionTime);

            previousAnswer = sum._getPreviousAnswer(2);
            expect(previousAnswer.reactionTime).toEqual(Object.assign({}, answerObjFalse).reactionTime);

            sum._scoreBase = [];
            previousAnswer = sum._getPreviousAnswer();
            expect(previousAnswer).toBeNull();
        });

    });

    describe("_computeAndSetReactionTime", function () {

        it('adjusts maxReactiontime when reactiontime of last answer is higher', function () {
            sum._maxReactionTime = 1234;
            var reactionTime = 1287;
            sum._computeAndSetReactionTime(reactionTime);
            expect(sum._maxReactionTime).toBe(1287);
        });

        it('adjusts minReactionTime when reactiontime of last answer is lower', function () {
            sum._minReactionTime = 1234;
            var reactionTime = 1012;
            sum._computeAndSetReactionTime(reactionTime);
            expect(sum._minReactionTime).toBe(1012);
        });

        it('computes aggregate average reactiontime', function () {
            sum._averageReactionTime = 876;
            sum._correct = 3;
            var reactionTime = 1012;
            sum._computeAndSetReactionTime(reactionTime);
            expect(sum._averageReactionTime).toBeGreaterThan(876);
            expect(sum._averageReactionTime).toBeLessThan(1012);
        });

    });

    describe("_updateScoreBase", function () {

        it('adds to the scoreBase when answer is the first answer for this sum', function () {
            sum._scoreBase = [];
            sum._updateScoreBase(234, true);
            expect(sum._scoreBase.length).toEqual(1);
        });

        it('adds to the scoreBase when answer is incorrect', function () {
            sum._scoreBase = [Object.assign({}, answerObjTrue)];
            sum._updateScoreBase(234, false);
            expect(sum._scoreBase[1].reactionTime).toEqual(234);
        });

        it('adds to the scoreBase when previous answer is incorrect', function () {
            sum._scoreBase = [Object.assign({}, answerObjFalse)];
            sum._updateScoreBase(234, true);
            expect(sum._scoreBase[1].reactionTime).toEqual(234);
        });

        it('adds to the scoreBase when previous answer was correct and given more than 12 hours ago', function () {
            sum._scoreBase = [{
                reactionTime: 2345,
                isCorrect: true,
                timestamp: Date.now() - (12 * 3600 * 1000) - 3
            }];
            sum._updateScoreBase(234, true);
            expect(sum._scoreBase[1].reactionTime).toEqual(234);
        });

        it('does NOT add to the scoreBase when previous answer was correct and given less than 12 hours ago', function () {
            sum._scoreBase = [{
                reactionTime: 2345,
                isCorrect: true,
                timestamp: Date.now() - (12 * 3600 * 1000) + 200
            }];
            sum._updateScoreBase(234, true);
            expect(sum._scoreBase.length).toEqual(1);
        });

        it('removes the first item of the scoreBase when it has more than 5 items', function () {
            sum._scoreBase = [Object.assign({}, answerObjTrue), Object.assign({}, answerObjTrue), Object.assign({}, answerObjFalse), Object.assign({}, answerObjTrue),
                Object.assign({}, answerObjFalse)];
            sum._updateScoreBase(234, false);
            expect(sum._scoreBase.length).toEqual(5);
        });
    });

    describe('_computeTimeDiff', function () {

        it('returns the difference in timestamp between two answerObjects, or null when one of them is null', function () {
            var earlier =  Object.assign({}, answerObjFalse);
            var later = Object.assign({}, answerObjTrue);
            later.timestamp =  earlier.timestamp + (12 * 3600 * 1000) + 500;
            var diff = sum._computeTimeDiff(earlier, later);
            var expectedDiff = 12 * 3600 * 1000;
            expect(diff).toBeGreaterThan(expectedDiff);
            diff = sum._computeTimeDiff(earlier, null);
            expect(diff).toBe(null);

        });
    });

    describe("_setScore", function () {

        it('sets score to 0 if there has not been any correct answer yet', function () {
            sum._scoreBase = [];
            sum._setScore();
            expect(sum._score).toBe(0);
            sum._scoreBase = [Object.assign({}, answerObjFalse), Object.assign({}, answerObjFalse), Object.assign({}, answerObjFalse)];
            sum._setScore();
            expect(sum._score).toBe(0);
            sum._scoreBase = [Object.assign({}, answerObjFalse), Object.assign({}, answerObjTrue), Object.assign({}, answerObjFalse)];
            sum._setScore();
            expect(sum._score).not.toBe(0);
        });

        it('sets score to 1 if last answer is false, but scorebase has one correct answer', function () {
            sum._scoreBase = [Object.assign({}, answerObjFalse), Object.assign({}, answerObjTrue), Object.assign({}, answerObjFalse), Object.assign({}, answerObjFalse),
                Object.assign({}, answerObjFalse)];
            sum._setScore();
            expect(sum._score).toBe(1);
            sum._scoreBase = [Object.assign({}, answerObjFalse), Object.assign({}, answerObjFalse), Object.assign({}, answerObjFalse), Object.assign({}, answerObjFalse),
                Object.assign({}, answerObjFalse)];
            sum._setScore();
            expect(sum._score).not.toBe(1);
        });

        it('sets score to 2 if last answer is correct, but with a slow reactiontime', function () {
            sum._scoreBase = [Object.assign({}, answerObjFalse), Object.assign({}, answerObjTrue)];
            sum._scoreBase[1].reactionTime = SumScoreTimes.MEDIOCRE + 0.6;
            sum._setScore();
            expect(sum._score).toBe(2);
            sum._scoreBase[1].reactionTime = SumScoreTimes.MEDIOCRE - 0.6;
            sum._setScore();
            expect(sum._score).not.toBe(2);
        });

        it('sets score to 3 if last answer is correct with a mediocre reactiontime', function () {
            sum._scoreBase = [Object.assign({}, answerObjFalse), Object.assign({}, answerObjTrue)];
            sum._scoreBase[1].reactionTime = SumScoreTimes.FAST +
                (SumScoreTimes.MEDIOCRE - SumScoreTimes.FAST) / 2;
            sum._setScore();
            expect(sum._score).toBe(3);
            sum._scoreBase[1].reactionTime = SumScoreTimes.FAST - SumScoreTimes.FAST / 2;
            sum._setScore();
            expect(sum._score).not.toBe(3);
        });

        it('sets score to 4 if last answer is correct but forelast answer is too slow, false or absent', function () {
            var fast = SumScoreTimes.FAST - SumScoreTimes.FAST / 2;
            sum._scoreBase = [Object.assign({}, answerObjTrue), Object.assign({}, answerObjTrue)];
            sum._scoreBase[0].reactionTime = SumScoreTimes.FAST  + SumScoreTimes.FAST / 2;
            sum._scoreBase[1].reactionTime = fast;
            sum._setScore();
            expect(sum._score).toBe(4);
            sum._scoreBase = [Object.assign({}, answerObjFalse), Object.assign({}, answerObjTrue)];
            sum._scoreBase[1].reactionTime = fast;
            sum._setScore();
            expect(sum._score).toBe(4);
            sum._scoreBase = [Object.assign({}, answerObjTrue)];
            sum._scoreBase[0].reactionTime = fast;
            sum._setScore();
            expect(sum._score).toBe(4);
        });

        it('sets score to 5 if last two answers are both correct and fast, are 12 hours apart, and preforelastquestion is not both correct and fast', function () {
            var fast = SumScoreTimes.FAST - SumScoreTimes.FAST / 2;
            sum._scoreBase = [Object.assign({}, Object.assign({}, answerObjTrue)), Object.assign({}, Object.assign({}, answerObjTrue)), Object.assign({}, Object.assign({}, answerObjTrue))];
            sum._scoreBase[2].reactionTime = fast;
            sum._scoreBase[1].reactionTime = fast;
            sum._scoreBase[2].timestamp =  sum._scoreBase[1].timestamp + ((12 * 3600 * 1000)) + 500;
            sum._scoreBase[0].reactionTime = SumScoreTimes.FAST  + SumScoreTimes.FAST / 2;
            sum._setScore();
            expect(sum._score).toBe(5);
            sum._scoreBase[0].reactionTime = fast;
            sum._scoreBase[0].isCorrect = true;
            sum._scoreBase[0].timestamp =  sum._scoreBase[1].timestamp - ((12 * 3600 * 1000)) - 500;
            sum._setScore();
            expect(sum._score).not.toBe(5);
        });

        it('sets score to 6 if last three answers are both correct and fast and 12 hours apart', function () {
            var fast = SumScoreTimes.FAST - SumScoreTimes.FAST / 2;
            sum._scoreBase = [Object.assign({}, Object.assign({}, answerObjTrue)), Object.assign({}, Object.assign({}, answerObjTrue)), Object.assign({}, Object.assign({}, answerObjTrue))];
            sum._scoreBase[2].reactionTime = fast;
            sum._scoreBase[1].reactionTime = fast;
            sum._scoreBase[0].reactionTime = fast;
            sum._scoreBase[1].timestamp =  sum._scoreBase[0].timestamp + ((12 * 3600 * 1000)) + 500;
            sum._scoreBase[2].timestamp =  sum._scoreBase[1].timestamp + ((12 * 3600 * 1000)) + 500;
            sum._setScore();
            expect(sum._score).toBe(6);
        });

    });

});

