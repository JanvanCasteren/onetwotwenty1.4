/**
 * Created by jan on 3/15/16.
 */
describe('Sumbuilder', function () {


    describe('_getOperatorValues()', function () {
        it('should return an array with the operands when values are given', function () {
            var operation = {
                operator: '*',
                values: '6,7,8,9'
            };

            sumBuilder = new Onetotwenty.Sumbuilder();
            var result = sumBuilder._getOperatorValues(operation);
            expect(result).toEqual(['6','7','8','9']);


            operation = {
                operator: '*',
                values: 6
            };
            result = sumBuilder._getOperatorValues(operation);
            expect(result).toEqual(['6']);
        });

        it('should return an array with the operands when start and end are given', function () {
            var operation = {
                operator: '*',
                start: 2,
                end: 4
            };

            sumBuilder = new Onetotwenty.Sumbuilder();
            var result = sumBuilder._getOperatorValues(operation);
            expect(result).toEqual([2,3,4]);

        });
    });
});
