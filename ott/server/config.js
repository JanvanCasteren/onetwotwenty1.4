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
    var sum, level, sumbuilder, sumObjects;

    //clear existing data from db
    //Levels.remove({});
    //Sums.remove({});

    //add levels
    _.each(data, function (levelObject) {
        if (!Levels.findOne({name: levelObject.name})) {
            levelObj = new Level({
                name: levelObject.name,
                label: levelObject.label,
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
        var sum = Sums.findOne({sum: sumObject.sum});
        if (!sum) {
            sum = new Sum(sumObject);
            sum.save();
        } else {
            Sums.update(
                { _id: sum._id },
                { $addToSet: {levels: sumObject.levels[0] } }
            )
        }
    });

});