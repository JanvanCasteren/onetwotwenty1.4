/*
 * Base class for Classes that are created through the Meteor transform
 * method on MongoDb documents
 *
 * The class defines base functionality for inserting or updating the
 * MongoDb document that provides the data for the class
 *
 * Use the simple parasitic combination inheritance pattern to create child classes:
 *
 * var base = $.oc.foundation.base,
 *     baseProto = Base.prototype
 *
 * var SubClass = function(params) {
 *     // Call the parent constructor, with a reference
 *     //to the collection as the second argument and
 *     //the documnet that should be transformed as the third
 *     //argument
 *     base.call(this, Collection, doc)
 * }
 *
 * SubClass.prototype = Object.create(BaseProto)
 * SubClass.prototype.constructor = SubClass
 *
 * // Child class methods can be defined only after the
 * // prototype is updated in the two previous lines
 *
 * SubClass.prototype.dispose = function() {
 *     // Call the parent method
 *     BaseProto.dispose.call(this)
 * };
 *
 * See:
 *
 * - https://developers.google.com/speed/articles/optimizing-javascript
 * - http://javascriptissexy.com/oop-in-javascript-what-you-need-to-know/
 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript
 *
 */

/**
 *
 * @param collection MongoDb collection from which a document is being transformed into
 * this class
 * @param Mongodb document
 * @constructor
 */
CollectionModelBase = function(collection, doc) {
  this._collection = collection;
  this._id = doc._id || null;
};

CollectionModelBase.prototype = {

  getState: function() {
    return {};
  },

  save: function () {
    if(this._id === null) {
      this.insert();
    }
    else {
      this.update();
    }
  },

  insert: function () {
    // remember the context since in callback it is changed
    var that = this;
    var doc = this.getState();

    this._collection.insert(doc, function (error, result) {
      that._id = result;
    });
  },

  update: function () {
    // remember the context since in callback it is changed
    var doc = this.getState();

    this._collection.update(this._id, doc);
  }
};
