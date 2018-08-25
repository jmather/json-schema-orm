const glob = require('glob')
const path = require('path')
// const _ = require('underscore')
const tools = require('../tools')
const ORM = require('./ORM')
const SchemaCollection = require('./SchemaCollection')

class Loader {
    constructor() {
    }

    /**
     *
     * @param {string} schemasBundleFile
     */
    loadSchemas(schemasBundleFile) {
        this.schemas = require(path.resolve(schemasBundleFile)).definitions.schemas
        const schema = new SchemaCollection(this.schemas)
        this.orm = new ORM(schema)

        return this.orm
    }

    /**
     *
     * @param {string} dataPath
     */
    loadData(dataPath) {
        const dataFiles = glob.sync(dataPath + '/**/**.yaml')
        dataFiles.forEach(dataFile => {
            const schemaName = path.basename(dataFile).split('.').splice(-2, 1)
            const repo = this.orm.getRepository(schemaName)
            const data = tools.loadYAML(dataFile)
            repo.add(data)
        })
    }

    _loadDataRelations() {
        // _.forEach(this.orm.getRepositories(), repo => {
        //     _.forEach(repo.getAll(), obj => {
        //
        //     })
        // })
    }
}

module.exports = Loader