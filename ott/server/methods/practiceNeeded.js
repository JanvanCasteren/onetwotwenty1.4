Meteor.methods({
    'levels.practiceNeeded'(/*{ levelName }*/) {
        //new SimpleSchema({
        //    levelName: { type: String }
        //}).validate({ levelName });
        let i, sums, practiceNeeded = false, levelsPracticeNeeded = {}
            ;

        //get all Levels
        levels = Levels.find({}).fetch();

        levels.forEach((level) => {
            if (level.type === LevelTypes.TEST) {
                sums = Testsums.find({levels: {$in: [level.name]}}).fetch();
            } else {
                sums = Sums.find({levels: {$in: [level.name]}}).fetch();
            }
            practiceNeeded = false;
            for (var i = 0; i < sums.length; i++) {
                if(sums[i].shouldBeIncluded()) {
                    practiceNeeded = true;
                    break;
                }
            }

            levelsPracticeNeeded[level.name] = practiceNeeded;
        });

        return levelsPracticeNeeded;
    }
});