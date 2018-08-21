const _ = require('underscore')

class Schema {
    /**
     *
     * @param {{ oneOf: [ Object ], definitions: { schemas: Object }}} schema
     */
    constructor(schema) {
        this.schema = schema
        this.filePaths = {}

        this._init()
    }

    _init() {
        _.forEach(this.schema, (data, schemaName) => {
            this.filePaths[data.path] = schemaName
        })
    }

    /**
     *
     * @param {string} name
     * @returns {{schema: Object, path: string }}
     */
    getByName(name) {
        if (! this.schema[name]) {
            throw new Error(`${name} is not defined.`)
        }

        return this.schema[name].schema
    }

    /**
     * Returns schema names
     * @returns {string[]}
     */
    getSchemaNames() {
        const schemaNames = []

        _.forEach(this.schema, (schema, schemaName) => schemaNames.push(schemaName))

        return schemaNames
    }

    getSchemaNameByPath(path) {
        if (! this.filePaths[path]) {
            throw new Error(`No schema known by path ${path}`)
        }

        return this.filePaths[path]
    }
}

module.exports = Schema