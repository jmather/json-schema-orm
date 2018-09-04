const Viz = require('viz.js')
const path = require('path')
const viz_path = path.dirname(require.resolve('viz.js'))
const { Module, render } = require(viz_path + '/full.render.js')
const Worker = require('tiny-worker')
const svgToImg = require('svg-to-img')

const convertDot = {
    dotToSvg: (dot) => {
        let worker = new Worker(viz_path + '/full.render.js')
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

