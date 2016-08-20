Template.numberline.helpers({

    data: function () {
        var helperConfig = Session.get('helperConfig');

        console.log(this.config);
        return 'hallo';
    }

});

Template.numberline.helpers({

    getData: function (config) {
        var lines = [],
            markers = [],
            pos,
            step = config.step,
            base, //base of the numberline (5 or 10)
            halfBaseWidth //the distance between markers will be
        //set dynamically
            ;

        const width = 700,
            height = 200,
            heightMarker = 50,
            markerY1 = 80,
            markerNumberY = 160,
            heightBetweenMarker = 20,
            betweenMarkerY1 = 90
            ;

        if (config === false) {
            return {
                lines: [],
                markers: []
            };
        }

        if (step > 5) {
            base = 10;
            pos = Math.floor(config.answer / 10);
            pos = pos * 10;
            halfBaseWidth = Math.round(700 / (step * 0.8));
        } else {
            base = 5;
            pos = Math.floor(config.answer / 5);
            pos = pos * 5;
            halfBaseWidth = Math.round(700 / (step));
        }

        //define lines
        //main line
        lines.push({x1: 0, x2: width, y1: height / 2, y2: height / 2});
        //markers
        //TODO: zorg ervoor dat de laatste mark nooit meer dan 1
        //tiental boven de 10x uitkomst ligt
        for (var i = 0; i < 4; i++) {
            let markerX = halfBaseWidth + i * 2 * halfBaseWidth;
            let markerNumber = pos + (i - 1) * base;
            lines.push({
                x1: markerX, x2: markerX, y1: markerY1,
                y2: markerY1 + heightMarker
            });
            markers.push({x: markerX, y: markerNumberY, number: markerNumber});
        }

        return {
            lines,
            markers
        };

    },

    /**
     * config has properties step and answer
     * (eg 7 and 35 in 5*7=35)
     * @param config
     * @returns {*}
     */
    getDataTableSum: function (config) {
        var markers = [],
            upperArcs = [],
            lowerArcs = [],
            arcs = [],
            lines = [],
            texts = []
            ;

        const step = config.step,
            pos = parseInt(config.answer / step),
            width = 700,
            stepWidth = width / 10,
            height = 200,
            heightMarker = 50,
            markerY1 = 80,
            markerNumberY = 160,
            arcAboveY = 40,
            arcBelowY = 80,
            arcTop = 60,
            getMultiplication = function (pos, step) {
                return pos + ' ' + '\u00d7' + ' ' + step;
            }
            ;


        if (config === false) {
            return {
                upperArcs: [],
                lowerArcs: [],
                markers: []
            };
        }

        //add default markers (begin and end)
        markers.concat([{pos: 0, text: 0}, {pos: 10 * step, text: 10 * step}]);

        switch (pos) {
            case 1:
                markers.push({pos: 1, text: '?'});
                upperArcs.push({start: 0, end: 1, textBelow: getMultiplication(1, step), textAbove: '+ ' + step});
                break;
            case 2:
                markers.push({pos: 1, text: step});
                markers.push({pos: 2, text: '?'});
                upperArcs.push({start: 0, end: 1, textBelow: getMultiplication(1, step)});
                upperArcs.push({start: 1, end: 2, textBelow: getMultiplication(1, step), textAbove: '+ ' + 2 * step});
                break;
            case 3:
                break;
            case 4:
                break;
            case 5:
                break;
            case 6:
                break;
            case 7:
                break;
            case 8:
                break;
            case 9:
                break;
            case 10:
                break;
        }

        //add main horizontal line
        lines.push({
            x1: 0,
            x2: width,
            y1: height / 2,
            y2: height / 2
        });

        //add lines and texts for markers
        markers.forEach((marker) => {
            let markerX = marker.pos * stepWidth;
            lines.push({
                x1: markerX,
                x2: markerX,
                y1: markerY1,
                y2: markerY1 + heightMarker
            });
            texts.push({
                    x: markerX,
                    y: markerNumberY,
                    text: marker.text,
                    className: 'marker'
                }
            );
        });

        //add lines and text for arcs
        //see explanation at https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
        //under Arcs
        //mx: x value of M (move to)
        //my: y value of M
        //rx: x-radius
        //ry: y-radius
        //xar: x-axis-rotation
        //laf: large-arc-flag
        //sf: sweep-flag
        upperArcs.forEach((arc) => {
            arcs.push({
                mx: arc.start,
                my: height/2,
                rx: (arc.end - arc.start) / 2 * stepWidth,
                ry: arcTop - height/2,
                xar: 0,
                laf: 0,
                sf: 1,
                dx: (arc.end - arc.start) * stepWidth,
                dy: 0
            });
            let markerX = (arc.start + (arc.end - arc.start) / 2) * stepWidth;
            if (arc.hasOwnProperty('textAbove')) {
                texts.push({
                        x: markerX,
                        y: arcAboveY,
                        text: arc.textAbove,
                        className: 'arc-above'
                    }
                );
            }
            if (arc.hasOwnProperty('textBelow')) {
                texts.push({
                        x: markerX,
                        y: arcBelowY,
                        text: arc.textBelow,
                        className: 'arc-below'
                    }
                );
            }
        });

        console.log({
            lines,
            arcs,
            texts
        });

        return {
            lines,
            arcs,
            texts
        };

    }

});
