const _ = require('underscore')

class ModelHandler {
    constructor(schema, orm) {
        this.schema = schema
        this.orm = orm
        this.overloaded_properties = {}

        this._buildGetters()
    }

    _buildGetters() {
        if (! this.schema.getRelations()) {
            return
        }

        _.forEach(this.schema.getRelations(), relation => {
            this.overloaded_properties[relation.local_property] = relation
        })
    }

    /**
     *
     * @param {Object} obj
     * @param {string} property
     */
    get(obj, property) {
        if (property === '___handler___') {
            return this
        }

        if (property === 'toJSON') {
            return () => obj
        }

        if (this.overloaded_properties[property]) {
            const definition = this.overloaded_properties[property]

            if (definition.type === 'one') {
                return this._getHasOne(definition, obj)
            }

            if (definition.type === 'many') {
                return this._getHasMany(definition, obj)
            }
        }

        return obj[property]
    }

    _getHasOne(definition, obj) {
        return this._getHasMany(definition, obj)[0]
    }

    _getHasMany(definition, obj) {
        const repo = this.orm.getRepositoryByPath(definition.schema)

        const search = {}
        search[`${definition.foreign_key}`] = obj[definition.local_key]
        return repo.getAllBy(search)
    }
}

module.exports = ModelHandler