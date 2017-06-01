Meteor.methods({
    'levels.getProgress'(/*{ levelName }*/) {
        //new SimpleSchema({
        //    levelName: { type: String }
        //}).validate({ levelName });
        let sums, totalScore, levelScores = {},
            userId = Meteor.userId()
            ;

        //get all Levels for current user
        levels = Levels.find({userId: userId}).fetch();

        levels.forEach((level) => {
            if (level.type === LevelTypes.TEST) {
                sums = Testsums.find({userId: userId, levels: {$in: [level.name]}}, {fields: {score: 1}, transform: null}).fetch();
            } else {
                sums = Sums.find({userId: userId, levels: {$in: [level.name]}}, {fields: {score: 1}, transform: null}).fetch();
            }

            totalScore = sums.reduce((sum, obj) => {
                return sum + obj.score;
            }, 0);

            totalScore = totalScore * 100 / (6 * sums.length);

            levelScores[level.name] = totalScore;
        });

        return levelScores;
    }
});