//define MongoDb collection with transform method
Sums = new Mongo.Collection("sums", {
    transform: function (doc) {
        return new Sum(doc);
    }
});

//get references to base class
var base = CollectionModelBase,
    baseProto = CollectionModelBase.prototype;

//create the constructor
Sum = function (doc, collection) {
    //call base class constructor
    base.call(this, Sums, doc);

    //initialise persistant private properties
    //(the fields of the MongoDB document)
    this._id = doc._id || null;
    this._orderNumber = doc.orderNumber;
    this._sum = doc.sum;
    this._levels = doc.levels;
    this._subLevel = doc.subLevel;
    this._score = doc.score || 0;
    this._maxReactionTime = doc.maxReactionTime || 0;
    this._minReactionTime = doc.minReactionTime || 0;
    this._averageReactionTime = doc.averageReactionTime || 0;
    this._tries = doc.tries || 0;
    this._correct = doc.correct || 0;
    this._incorrect = doc.incorrect || 0;
    //records reactionTime, isCorrect and timestamp of last
    //five answers that count for the score base
    //a correct answer only gets added if the previous
    //answer was incorrect, or if the previous answer
    //was added more than 12 hours ago
    //The scorebase is used to compute the score
    this._scoreBase = doc.scoreBase || [];
    //The history collects the same data as the scorebase,
    //but collects all tries (and keeps the last ten of them)
    this._history = doc.history || [];


    //initialise other private properties
    this._givenAnswer = null;
};

//inherit the base class prototype
Sum.prototype = Object.create(baseProto);
//and rebind the constructor
Sum.prototype.constructor = Sum;

//properties
Object.defineProperties(Sum.prototype, {
    id: {
        get: function () {
            return this._id;
        }
    },
    sum: {
        get: function () {
            return this._sum;
        }
    },
    table: {
        get: function() {
            //if the sum is a multiplication, the table
            //can be retrieved by returning the the second
            //argument of the sum
            if(this._sum.indexOf('*') !== -1) {
                return parseInt(this._sum.split('*')[1]);
            } else {
                return false;
            }
        }
    },
    orderNumber: {
        get: function () {
            return this._orderNumber;
        }
    },
    levels: {
        get: function () {
            return this._levels;
        }
    },
    subLevel: {
        get: function () {
            return this._subLevel;
        }
    },
    score: {
        get: function () {
            return this._score;
        }
    },
    answer: {
        get: function () {
            return this._sum.computeSum();
        }
    },
    givenAnswer: {
        get: function () {
            return this._givenAnswer;
        },
        set: function (givenAnswer) {
            this._givenAnswer = givenAnswer;
        }
    },
    minReactionTime: {
        get: function() {
            return this._minReactionTime;
        }
    }
})
;

//methods
Sum.prototype = _.extend(Sum.prototype, {

    handleAnswer: function (givenAnswer, reactionTime) {
        check(givenAnswer, Number);
        check(reactionTime, Number);

        var isCorrect = false;
        this._givenAnswer = givenAnswer;

        //update correct and reactime
        if (givenAnswer === this.answer) {
            this._computeAndSetReactionTime(reactionTime);
            isCorrect = true;
            this._correct++;
        }
        else {
            this._incorrect++;
        }

        //add try
        this._tries++;

        //add to history and recompute score
        this._updateHistory(reactionTime, isCorrect);
        this._updateScoreBase(reactionTime, isCorrect);
        this._setScore();

        //save
        this.save();
    },

    /**
     * Must return true if we want this sum to be included
     * in a new queue of sums
     */
    shouldBeIncluded: function() {
        //return false if the last two tries in the history
        //were correct and done less than an hour ago
        var i,
            hl = this._history.length,
            shouldBeIncluded = true
        ;

        if(hl < 2) {
            return true;
        }

        for (i = hl - 1; i >= hl - 2; i--) {
            if(this._history[i].isCorrect === false) {
                return true;
            }
        }

        //return false if the forelast try was less than an hour ago
        return ( (Date.now() - this._history[hl - 2].timestamp) >  (60*60*1000) );
    },

    lastWasCorrect: function() {
        if(this._history.length === 0) {
            return true;
        } else {
            return (this._history[this._history.length -1].isCorrect === true);
        }
    },

    _getPreviousAnswer: function (stepsBack) {
        stepsBack = stepsBack || 1;
        return (this._scoreBase.length >= stepsBack) ? this._scoreBase[this._scoreBase.length - stepsBack] : null;
    },

    _computeAndSetReactionTime: function (reactiontime) {
        if (reactiontime > this._maxReactionTime) {
            this._maxReactionTime = reactiontime;
        }
        if (reactiontime < this._minReactionTime || this._minReactionTime === 0) {
            this._minReactionTime = reactiontime;
        }
        this._averageReactionTime = ((this._averageReactionTime * this._correct) + reactiontime) / (this._correct + 1);
    },

    _updateHistory: function (reactionTime, isCorrect) {
        var timestamp = Date.now();
        var answerData = {
            reactionTime: reactionTime,
            isCorrect: isCorrect,
            timestamp: timestamp
        };
        this._history.push(answerData);
    },

    /**
     * Use this to recompute the score after
     * the last given answer has been registered
     * TODO: why do I keep a scorebase of five elements, when I only
     * use the last three of them for my computations?
     */
    _updateScoreBase: function (reactionTime, isCorrect) {
        var previousAnswer = this._getPreviousAnswer();
        var timestamp = Date.now();
        var answerData = {
            reactionTime: reactionTime,
            isCorrect: isCorrect,
            timestamp: timestamp
        };

        if (!previousAnswer) {
            //first answer, so add to scoreBase anyway
            this._scoreBase.push(answerData);
            return;
        }

        //add entry to scoreBase if
        // 1. answer is incorrect or
        // 2. last answer was incorrect or
        // 3. last answer was correct and given more than 12 hours ago
        if (!isCorrect || !previousAnswer.isCorrect || (timestamp - previousAnswer.timestamp) > (12 * 3600 * 1000)) {
            this._scoreBase.push(answerData);
        }

        //scoreBase must not contain more than 5 elements
        if (this._scoreBase.length > 5) {
            this._scoreBase.shift();
        }
    },


    _computeTimeDiff: function (earlier, later) {
        if (earlier && later) {
            return later.timestamp - earlier.timestamp;
        } else {
            return null;
        }
    },

    _setScore: function () {
        var cntCorrect = 0,
            lastRegisteredAnswer = this._getPreviousAnswer(1),
            foreLastRegisteredAnswer = this._getPreviousAnswer(2),
            preForeLastRegisteredAnswer = this._getPreviousAnswer(3),
            lastTimeDiff = this._computeTimeDiff(foreLastRegisteredAnswer, lastRegisteredAnswer),
            foreLastTimeDiff = this._computeTimeDiff(preForeLastRegisteredAnswer, foreLastRegisteredAnswer)
            ;

        this._scoreBase.forEach(function (answerData) {
            if (answerData.isCorrect) {
                cntCorrect++;
            }
        });

        //0: som is nog geen enkele keer goed gemaakt of nog niet aangeboden
        if (cntCorrect === 0) {
            return this._score = 0;
        }

        //een: soms is laatste keer fout gemaakt nadat ie eerder al goed is gemaakt
        if (lastRegisteredAnswer.isCorrect === false) {
            return this._score = 1;
        }

        //twee: som de laatste keer goed gemaakt op een langzaam tempo
        if (lastRegisteredAnswer.reactionTime > SumScoreTimes.MEDIOCRE) {
            return this._score = 2;
        }

        //drie: som de laatste keer goed gemaakt op een gemiddelde tempo
        if (lastRegisteredAnswer.reactionTime < SumScoreTimes.MEDIOCRE && lastRegisteredAnswer.reactionTime > SumScoreTimes.FAST) {
            return this._score = 3;
        }

        //vier: som is de laatste keer goed gemaakt op het vereiste tempo, maar er was geen voorgaande poging
        //of bij die voorgaande poging was het antwoord incorrect
        if (foreLastRegisteredAnswer === null || foreLastRegisteredAnswer.isCorrect === false) {
            return this._score = 4;
        }

        if (foreLastRegisteredAnswer.reactionTime <= SumScoreTimes.FAST && lastTimeDiff > (12 * 3600 * 1000)) {
            if (preForeLastRegisteredAnswer !== null && preForeLastRegisteredAnswer.isCorrect === true &&
                preForeLastRegisteredAnswer.reactionTime <= SumScoreTimes.FAST && foreLastTimeDiff > (12 * 3600 * 1000)) {
                //zes: som is de laatste drie  keren goed gemaakt op het vereiste tempo,
                // waarbij er minimaal 12 uur verschil zat tussen de pogingen, daarmee wordt ie als voldoende geautomatiseerd beschouwd en niet verder aangeboden.
                return this._score = 6;
            } else {
                //vijf: som is de voorlaatste keer ook goed gemaakt op het vereiste tempo
                //waarbij er minimaal 12 uur verschil zat tussen de pogingen
                return this._score = 5;
            }
        }
        else {
            //zoniet, dan toch score 4
            return this._score = 4;
        }

    },

    getState: function () {
        return {
            sum: this._sum,
            orderNumber: this._orderNumber,
            levels: this._levels,
            subLevel: this._subLevel,
            score: this._score,
            maxReactionTime: this._maxReactionTime,
            minReactionTime: this._minReactionTime,
            averageReactionTime: this._averageReactionTime,
            tries: this._tries,
            correct: this._correct,
            incorrect: this._incorrect,
            scoreBase: this._scoreBase,
            history: this._history
        }
    }
})
;







