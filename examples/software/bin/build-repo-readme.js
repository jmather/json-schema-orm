#!/usr/bin/env node
const cli = require('cli')
const path = require('path')
const JS_ORM = require(__dirname + '/../../../index')
const _ = require('underscore')
const url = require('url')
const dns = require('dns')
const fs = require('fs')
const yaml = require('js-yaml')
const renderDot = require(__dirname + '/../../../src/visualization/convert-dot').dotToPng
const dot = require('dot')
const sanitizeFilename = require('sanitize-filename')
dot.templateSettings.strip = false
const dots = dot.process({ path: __dirname + "/build-repo-readme/templates"})

cli.main((args) => {
    const buildRoot = path.resolve(`${__dirname}/../build`)
    const dataRoot = path.resolve(`${__dirname}/../data`)
    const schemasPath = path.resolve(`${__dirname}/../bundle/schemas.json`)

    console.log('Compiling data model...')
    const loader = new JS_ORM.Loader()

    const orm = loader.loadSchemas(schemasPath)
    loader.loadData(dataRoot)

    const graph = {}

    const repo = orm.getRepository('repository').get(args[0])

    // console.log(repo)

    const outputFileName = sanitizeFilename(args[0] + '.md')
    const outputFilePath = __dirname + '/../build/repo-readmes/' + outputFileName
    const relPath = path.relative(process.cwd(), outputFilePath)

    fs.writeFileSync(outputFilePath, dots.readme(repo))
    cli.ok('Wrote repo readme to ' + relPath + '...')
})
