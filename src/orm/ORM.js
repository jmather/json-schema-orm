const _ = require('underscore')

class ORM {
    /**
     *
     * @param {SchemaCollection} schema
     */
    constructor(schema) {
        this.schemaCollection = schema
        this.repositories = {}

        this._buildRepositories()
    }

    _buildRepositories() {
        this.schemaCollection.getSchemaNames().forEach(schemaName => {
            const schema = this.schemaCollection.getByName(schemaName)
            this.repositories[schemaName] = new this.Repository(schemaName, schema, this)
        })
    }

    getRepositories() {
        return _.map(this.repositories, r => r)
    }

    getRepository(name) {
        if (! this.repositories[name]) {
            throw new Error(`Schema ${name} is not defined!`)
        }

        return this.repositories[name]
    }

    getRepositoryByPath(path) {
        const schemaName = this.schemaCollection.getSchemaNameByPath(path)

        return this.getRepository(schemaName)
    }
}

ORM.prototype.Repository = require('./Repository')
ORM.prototype.ModelHandler = require('./ModelHandler')

module.exports = ORM