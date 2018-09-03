#!/usr/bin/env node
const convertDot = require('../src/visualization/convert-dot')
const cli = require('cli')
const fs = require('fs')

cli.parse({
    input: ['i', 'Input DOT file', 'file', null ],
    output: ['o', 'Output PNG file', 'file', null ],
})

cli.main((args, options) => {
    if (! options.input) {
        cli.error('Input is required! -h for help!')
        process.exit(1)
    }

    if (! options.output) {
        cli.error('Output is required! -h for help!')
        process.exit(1)
    }

    const dotString = fs.readFileSync(options.input).toString()

    convertDot.dotToPng(dotString).then(png => {
        fs.writeFileSync(options.output, png)
    })
})