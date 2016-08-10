describe('String', function () {
    'use strict';

    describe('computeSum', function () {
        it('should compute a sum given as a string and return the result as integer', function () {
            var sums = [
                {
                    sum: '1+2',
                    result: 3
                },
                {
                    sum: '3 - 2 ',
                    result: 1
                },
                {
                    sum: '5*7',
                    result: 35
                },
                {
                    sum: ' 8/ 2',
                    result: 4
                },
            ];

            sums.forEach(function(obj) {
                expect(obj.sum.computeSum()).toBe(obj.result);
            });
        });
    });
});