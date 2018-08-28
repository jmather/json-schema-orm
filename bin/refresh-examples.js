#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const _ = require('underscore')
const glob = require('glob')
const exec = require('child_process')

const examples = [ 'software' ]

_.forEach(examples, example => {
    const dataFiles = glob.sync(path.resolve(__dirname, `../examples/${example}/data/**`))
    const schemaFiles = glob.sync(path.resolve(__dirname, `../examples/${example}/schemas/**`))
    const bundleFile = path.resolve(__dirname, `../examples/${example}/bundle/schemas.json`)

    const sourceFiles = dataFiles.concat(schemaFiles)

    const refTime = fs.statSync(bundleFile).ctime
    const maxSourceFile = _.max(sourceFiles.map(file => {
        return fs.statSync(file).ctime
    }))

    if (refTime < maxSourceFile || process.argv.indexOf('--force') > -1) {
        const npm = exec.spawn('npm', [ 'run',  'bundle-examples' ])

        npm.stdout.on('data', function (data) {
            process.stdout.write(data.toString())
        })

        npm.stderr.on('data', function (data) {
            process.stderr.write(data.toString())
        })
    }
})
