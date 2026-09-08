const Viz = require('@viz-js/viz')
const svg2img = require('svg-to-img')

const convertDot = {
    dotToPng: (dot) => {
        return Viz.instance().then(viz => {
            const svg = viz.render(dot, { format: 'svg' })
            // console.log({ svg })
            return svg2img.from(svg.output).toPng()
        })
    }
}

module.exports = convertDot

