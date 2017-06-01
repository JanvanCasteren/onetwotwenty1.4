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

})
;