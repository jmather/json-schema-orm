#!/usr/bin/env node
const debug = require('debug');
// debug.enable("*")
debug.log = console.info.bind(console);

const cli = require('cli')
const path = require('path')
const JS_ORM = require(__dirname + '/../../../index')
const WikiGenerator = require('./build-wiki/lib/ORMWikiGenerator')
const tools = require('./build-wiki/lib/tools')

const WIKI_ROOT = path.relative(process.cwd(), __dirname + '/../build/wiki')
console.log({WIKI_ROOT})

const ModelHandler = JS_ORM.ORM.ORM.prototype.ModelHandler

class OverloadedModelHandler extends ModelHandler {
    constructor(schema, orm) {
        super(schema, orm)
    }

    get(obj, property) {
        if (property === 'file_path') {
            return `${WIKI_ROOT}/${this.schema.schema.orm.plural}/${tools.sanitizeFileName(this.get(obj, 'name'))}.md`
        } else if (property === 'wiki_path') {
            return `/${WIKI_ROOT}/${this.schema.schema.orm.plural}/${tools.sanitizeFileName(this.get(obj, 'name'))}.md`
        } else {
            return ModelHandler.prototype.get.call(this, obj, property)
        }
    }
}

JS_ORM.ORM.ORM.prototype.ModelHandler = OverloadedModelHandler

cli.main((args) => {
    const buildRoot = path.resolve(`${__dirname}/../build/wiki`)
    const dataRoot = path.resolve(`${__dirname}/../data`)
    const schemasPath = path.resolve(`${__dirname}/../bundle/schemas.json`)

    console.log('Compiling data model...')
    const loader = new JS_ORM.Loader()

    const orm = loader.loadSchemas(schemasPath)
    loader.loadData(dataRoot)

    const generator = new WikiGenerator()
    generator.generate(orm, buildRoot)
})