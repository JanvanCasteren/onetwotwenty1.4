describe("Level", function () {
  "use strict";

    xit("should be created with name, animation and subLevels", function () {
    spyOn(Sums, "insert").and.callFake(function(doc, callback) {
      // simulate async return of id = "1";
      callback(null, "1");
    });

    var obj =  {
      name: 'oneTwoTen',
      animation: 'line',
      //subLevels: [1,2]
    };

    var level = new Level(obj);

    var levelState = level.getState();

    expect(level.name).toBe('oneTwoTen');
    expect(level.animation).toBe('line');
    //expect(level.subLevels).toEqual([1,2]);


    level.save();

    // id should be defined
    expect(level.id).toEqual("1");
    expect(level.insert).toHaveBeenCalledWith(levelState, jasmine.any(Function));
  });
});