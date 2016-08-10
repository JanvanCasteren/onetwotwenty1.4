Onetotwenty.Sumbuilder = function () {

};

//generates an array of sums
Onetotwenty.Sumbuilder.prototype = {

    sums: function (start, end, operator, values, inverted) {
        var i,
            j,
            k,
            l = values.length,
            sums = [],
            inverted = inverted || false;

        for (i = start; i <= end; i++) {
            for (j = 0; j < l; j++) {
                k = values[j];
                if (operator === '-' && k > i) {
                    //don't add sums like 1-2
                    continue;
                }
                sums.push(i.toString() + operator + k.toString());
            }
        }

        return sums;
    },

    //generates a complete object with all the sums for a level
    buildSumObjects: function (levelObjects) {
        var self = this,
            allSums,
            sums,
            sumObjects = [],
            levelObj,
            orderNumber
            ;

        _.each(levelObjects, function (levelObject) {
            _.each(levelObject.subLevels, function (subLevel, sublevelNr) { //sublevelNr is the index of the sublevel in its list
                _.each(subLevel.operations, function (operation) {

                    sums = self.sums(subLevel.range.start, subLevel.range.end, operation.operator,
                        self._getOperatorValues(operation), subLevel.inverted || false);
                    //create a Sum object for each of the sums
                    orderNumber = 0;
                    _.each(sums, function (sum) {
                        orderNumber++;
                        sumObjects.push({
                            sum: sum,
                            type: levelObject.type,
                            orderNumber: orderNumber,
                            levels: [levelObject.name],
                            subLevel: sublevelNr
                        });
                    });
                });
            });
        });

        return sumObjects;
    },

    //an operation object has a start and end setting, or a values
    //setting with a komma-separated list of values
    _getOperatorValues: function (operation) {
        if (operation.values) {
            return operation.values.toString().trim().split(/[\s,]+/).join().split(',');
        }
        else {
            var arr = [];
            for (var i = operation.start; i <= operation.end; i++) {
                arr.push(i);
            }
            return arr;
        }
    }


};