const _ = require('underscore')
const Schema = require('./Schema')

class SchemaCollection {
    /**
     *
     * @param {{ oneOf: [ Object ], definitions: { schemas: Object }}} schemaCollection
     * @param {typeof Schema} [schemaClass]
     */
    constructor(schemaCollection, schemaClass = Schema) {
        this.schemaCollection = schemaCollection
        this.filePaths = {}
        this.Schema = schemaClass

        this._init()
    }

    _init() {
        _.forEach(this.schemaCollection, (data, schemaName) => {
            this.filePaths[data.path] = schemaName
        })
    }

    /**
     *
     * @param {string} name
     * @returns {Schema}
     */
    getByName(name) {
        if (! this.schemaCollection[name]) {
            throw new Error(`${name} is not defined.`)
        }

        return new this.Schema(name, this.schemaCollection[name].schema)
    }

    /**
     * Returns schema names
     * @returns {string[]}
     */
    getSchemaNames() {
        const schemaNames = []

        _.forEach(this.schemaCollection, (schema, schemaName) => schemaNames.push(schemaName))

        return schemaNames
    }

    getSchemaNameByPath(path) {
        if (! this.filePaths[path]) {
            throw new Error(`No schema known by path ${path}`)
        }

        return this.filePaths[path]
    }
}

module.exports = SchemaCollection