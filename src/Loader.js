const glob = require('glob')
// const _ = require('underscore')
const tools = require('./tools')
const ORM = require('./orm/ORM')
const SchemaCollection = require('./orm/SchemaCollection')

class Loader {
    constructor() {
    }

    /**
     *
     * @param {string|Object} schemasBundleFile
     */
    loadSchemas(schemasBundleFile) {
        this.schemas = require(schemasBundleFile).definitions.schemas
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
            const schemaName = dataFile.split('/').pop().split('.').splice(-2, 1)
            const repo = this.orm.getRepository(schemaName)
            const data = tools.loadYAML(dataFile)
            repo.add(data)
        })
    }
}

module.exports = Loader