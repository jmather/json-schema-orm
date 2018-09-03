const Viz = require('viz.js')
const { Module, render } = require(__dirname + '/../../node_modules/viz.js/full.render.js')
const Worker = require('tiny-worker')
const svgToImg = require('svg-to-img')

const convertDot = {
    dotToSvg: (dot) => {
        let worker = new Worker(__dirname + '/../../node_modules/viz.js/full.render.js')
        let viz = new Viz({worker});

        return viz.renderString(dot)
            .then(function (result) {
                worker.terminate()
                return result
            });
    },

    svgToPng: (svg) => {
        return svgToImg.from(svg).toPng()
    },

    dotToPng: (dot) => {
        return convertDot.dotToSvg(dot).then((svg) => {
            return convertDot.svgToPng(svg)
        })
    }
}

module.exports = convertDot

