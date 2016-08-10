//set up collection with transform method
Levels = new Mongo.Collection("levels", {
    transform: function (doc) {
        return new Level(doc);
    }
});

//reference to base class
var base = CollectionModelBase,
    baseProto = CollectionModelBase.prototype;

//CONSTRUCTOR
Level = function (doc) {
    //call base class constructor
    base.call(this, Levels, doc);

    //initialise persistant private properties
    //(the fields of the MongoDB document)
    this._name = doc.name;
    this._label = doc.label;
    this._type = doc.type;
    this._animation = doc.animation;
    this._queue = doc.queue || [];

//  this._subLevels = obj.subLevels;

};
//END CONSTRUCTOR

//inherit prototype from base class
Level.prototype = Object.create(baseProto);
//rebind constructor
Level.prototype.constructor = Level;

//PROPERTIES
Object.defineProperties(Level.prototype, {
    id: {
        get: function () {
            return this._id;
        }
    },
    name: {
        get: function () {
            return this._name;
        }
    },
    label: {
        get: function () {
            return this._label;
        }
    },
    type: {
        get: function () {
            return this._type;
        }
    },
    animation: {
        get: function () {
            return this._animation;
        }
    }

});
//END PROPERTIES

//METHODS
Level.prototype = _.extend(Level.prototype, {

    /**
     * Returns the first sum in the queue, if the queue
     * is empty, regenerate it first
     */
    getNextSum: function () {
        var sumId;
        if (this._queue.length === 0) {
            this.createQueue();
        }
        sumId = this._queue.shift();
        this.save();
        return sumId;
    },

    createQueue: function () {
        var self = this,
            lastFalse = [],
            lastCorrect = []
            ;


        this._queue = [];
        //TODO: we do not use the sublevels now
        var sumCursor = Sums.find({levels: {$in: [this.name]}});
        sumCursor.forEach(function (sum) {
            if (sum.shouldBeIncluded()) {
                if (sum.lastWasCorrect()) {
                    lastCorrect.push(sum.id);
                } else {
                    lastFalse.push(sum.id);
                }
            }
        });

        //randomly order both queues and then add them to queue
        lastFalse = _.shuffle(lastFalse);
        lastCorrect = _.shuffle(lastCorrect);
        this._queue = [].concat(lastFalse, lastCorrect);
       console.log(this._queue);
    },

    /**
     * Returns the total and the maximum of the scores
     * of all the sums in this level
     */
    getScore: function () {
        var sumCursor = Sums.find({
                level: this.name
            }),
            levelScore = {
                total: 0,
                max: sumCursor.count() * 6
            }
            ;

        sumCursor.forEach(function (sum) {
            levelScore.total = levelScore.total + sum.score;
        });

        return levelScore;
    },


    getState: function () {
        return {
            name: this._name,
            label: this._label,
            type: this._type,
            animation: this._animation,
            queue: this._queue
            //subLevels: this._subLevels
        };
    }
});
