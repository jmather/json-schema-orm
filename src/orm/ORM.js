const _ = require('underscore')
const ModelHandler = require('./ModelHandler')
const Repository = require('./Repository')

class ORM {
    /**
     *
     * @param {SchemaCollection} schemaCollection
     * @param {typeof ModelHandler} [modelHandlerClass]
     * @param {typeof Repository} [repositoryClass]
     */
    constructor(schemaCollection, modelHandlerClass = ModelHandler, repositoryClass = Repository) {
        this.schemaCollection = schemaCollection
        this.repositories = {}

        this.ModelHandler = modelHandlerClass
        this.Repository = repositoryClass

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

module.exports = ORM