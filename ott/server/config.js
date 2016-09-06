Tempglobal = null;
//var fs = Npm.require('fs');

try {
    //var data = YAML.safeLoad(fs.readFileSync('/private/config/sums.yml', 'utf8'));
    //YAML library: https://github.com/nodeca/js-yaml
    //Meteor assets: http://docs.meteor.com/#/full/assets
    var data = YAML.safeLoad(Assets.getText('config/tables.yml'));
} catch (e) {
    throw new Error('Probleem bij laden YAML configuratie: ' + e.message);
}

Meteor.startup(function () {
    var sum, level, sumbuilder, sumObjects, orderNumber;

    //clear existing data from db
    //Levels.remove({});
    //Sums.remove({});
    //Testsums.remove({});

    //add levels
    orderNumber = 0;
    _.each(data, function (levelObject) {
        orderNumber++;
        if (!Levels.findOne({name: levelObject.name})) {
            levelObj = new Level({
                name: levelObject.name,
                label: levelObject.label,
                orderNumber: orderNumber,
                animation: levelObject.animation,
                type: levelObject.type
            });
            levelObj.save();
        }
    });

    //add sums
    sumbuilder = new Onetotwenty.Sumbuilder();
    sumObjects = sumbuilder.buildSumObjects(data);
    _.each(sumObjects, function (sumObject) {
        if (sumObject.type === 'practice') {
            sum = Sums.findOne({sum: sumObject.sum});
            if (!sum) {
                sum = new Sum(sumObject);
                sum.save();
            } else {
                Sums.update(
                    {_id: sum._id},
                    {$addToSet: {levels: sumObject.levels[0]}}
                )
            }
        }
        if (sumObject.type === LevelTypes.TEST) {
            sum = Testsums.findOne({sum: sumObject.sum});
            if (!sum) {
                sum = new Testsum(sumObject);
                sum.save();
            } else {
                Testsums.update(
                    {_id: sum._id},
                    {$addToSet: {levels: sumObject.levels[0]}}
                )
            }
        }
    });


})
;