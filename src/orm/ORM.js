const Schema = require('./Schema')
const Repository = require('./Repository')

class ORM {
    /**
     *
     * @param {Schema} schema
     */
    constructor(schema) {
        this.schema = schema
        this.repositories = {}

        this._buildRepositories()
    }

    _buildRepositories() {
        this.schema.getSchemaNames().forEach(schemaName => {
            const schema = this.schema.getByName(schemaName)
            this.repositories[schemaName] = new Repository(schemaName, schema, this)
        })
    }

    getRepository(name) {
        if (! this.repositories[name]) {
            throw new Error(`Schema ${name} is not defined!`)
        }

        return this.repositories[name]
    }

    getRepositoryByPath(path) {
        const schemaName = this.schema.getSchemaNameByPath(path)

        return this.getRepository(schemaName)
    }
}

module.exports = ORM