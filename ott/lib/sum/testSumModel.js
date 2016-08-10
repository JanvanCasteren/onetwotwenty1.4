//define MongoDb collection with transform method
Testsums = new Mongo.Collection("testsums", {
    transform: function (doc) {
        return new Testsum(doc);
    }
});

//get references to base class
var base = Sum,
    baseProto = Sum.prototype;

//create the constructor
Testsum = function (doc) {
    //call base class constructor
    base.call(this, doc, Testsums);
};

//inherit the base class prototype
Testsum.prototype = Object.create(baseProto);
//and rebind the constructor
Testsum.prototype.constructor = Testsum;
