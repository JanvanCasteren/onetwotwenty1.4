Template.numberline.helpers({

    data: function () {
        var helperConfig = Session.get('helperConfig');

        console.log(this.config);
        return 'hallo';
    }

});

Template.numberline.helpers({

     /**
     * config has properties step and answer
     * (eg 7 and 35 in 5*7=35)
     * and base. Base will be the position from which the
     * help will be constructed
     * @param config
     * @returns {*}
     */
    getDataTableSum: function (config) {
        var markers = [],
            arcsData = [],
            arcs = [],
            lines = [],
            texts = []
            ;

        const step = config.step,
            pos = parseInt(config.answer / step),
            width = 700,
            stepWidth = width / 10,
            height = 200,
            heightMarker = 60,
            markerY1 = 70,
            markerNumberY = 165,
            arcTop = 60,
            arcTextY = 45,
            getMultiplication = function (pos, step) {
                return pos + '\u00d7' + step;
            }
            ;


        if (config === false) {
            return {
                lines: [],
                arcs: [],
                texts: []
            };
        }

        //add default markers (begin and end)
        markers = markers.concat([{pos: 0, text: 0}, {pos: 10, text: 10 * step}]);

        switch (pos) {
            case 1:
                markers.push({pos: 1, text: '?'});
                arcsData.push({start: 0, end: 1, text: '+ ' + step});
                break;
            case 2:
                markers.push({pos: 1, text: step});
                markers.push({pos: 2, text: '?'});
                arcsData.push({start: 0, end: 1, text: getMultiplication(1, step), small: true});
                arcsData.push({start: 1, end: 2, text: '+ ' + step, shift: true});
                break;
            case 3:
                markers.push({pos: 2, text: 2*step});
                markers.push({pos: 3, text: '?'});
                arcsData.push({start: 0, end: 2, text: getMultiplication(2, step), small: true});
                arcsData.push({start: 2, end: 3, text: '+ ' + step, shift: true});
                break;
            case 4:
                markers.push({pos: 2, text: 2*step});
                markers.push({pos: 4, text: '?'});
                arcsData.push({start: 0, end: 2, text: getMultiplication(2, step), small: true});
                arcsData.push({start: 2, end: 4, text: '+ (' + getMultiplication(2, step) + ')', small: true, shift: true});
                break;
            case 5:
                markers.push({pos: 5, text: '?'});
                arcsData.push({start: 0, end: 5, text: getMultiplication(5, step), small: true});
                arcsData.push({start: 5, end: 10, text: getMultiplication(5, step), small: true});
                break;
            case 6:
                markers.push({pos: 5, text: 5*step});
                markers.push({pos: 6, text: '?'});
                arcsData.push({start: 0, end: 5, text: getMultiplication(5, step), small: true});
                arcsData.push({start: 5, end: 6, text: '+ ' + step, shift: true});
                break;
            case 7:
                markers.push({pos: 5, text: 5*step});
                markers.push({pos: 7, text: '?'});
                arcsData.push({start: 0, end: 5, text: getMultiplication(5, step), small: true});
                arcsData.push({start: 5, end: 7, text: '+ (' + getMultiplication(2, step) + ')', small: true, shift: true});
                break;
            case 8:
                markers.push({pos: 8, text: '?'});
                arcsData.push({start: 8, end: 10, text: '- (' + getMultiplication(2, step) + ')', small: true, shift: true});
                break;
            case 9:
                markers.push({pos: 9, text: '?'});
                arcsData.push({start: 9, end: 10, text: '- ' + step, shift: true});
                break;
            case 10:
                arcsData.push({start: 0, end: 10, text: getMultiplication(10, step), small: true});
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
            let className = 'marker';
            if (marker.text === '?') {
                className = 'marker question';
            }
            texts.push({
                    x: markerX,
                    y: markerNumberY,
                    text: marker.text,
                    className: className
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
        arcsData.forEach((arc) => {
            arcs.push({
                mx: arc.start * stepWidth,
                my: height / 2,
                rx: (arc.end - arc.start) / 2 * stepWidth,
                ry: arcTop - height / 2,
                xar: 0,
                laf: 0,
                sf: 1,
                dx: (arc.end - arc.start) * stepWidth,
                dy: 0
            });
            let markerX = (arc.start + (arc.end - arc.start) / 2) * stepWidth;
            let className = 'arc';
            if (arc.hasOwnProperty('small') && arc.small === true) {
                className += ' small';
            }
            if (arc.hasOwnProperty('shift') && arc.shift === true) {
                className += ' shift';
            }
            texts.push({
                    x: markerX,
                    y: arcTextY,
                    text: arc.text,
                    className: className
                }
            );
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
