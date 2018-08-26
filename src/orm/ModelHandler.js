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

            if (definition.type === 'has_one') {
                return this._getHasOne(definition, obj)
            }

            if (definition.type === 'belongs_to_one') {
                return this._getBelongsToOne(definition, obj)
            }

            if (definition.type === 'has_many') {
                return this._getHasMany(definition, obj)
            }

            if (definition.type === 'belongs_to_many') {
                return this._getBelongsToMany(definition, obj)
            }
        }

        return obj[property]
    }

    _getHasOne(definition, obj) {
        let localSearch = []

        if (definition.local_key instanceof Array) {
            localSearch = definition.local_key
        } else {
            localSearch = [definition.local_key]
        }

        const value = _.property(localSearch)(obj)

        const foreignSearch = (definition.foreign_key instanceof Array) ? definition.foreign_key : [definition.foreign_key]
        const repo = this.orm.getRepositoryByPath(definition.schema)

        return repo.getAllBy(foreignSearch, value)[0]
    }

    _getBelongsToOne(definition, obj) {
        let localSearch = []

        if (definition.local_key instanceof Array) {
            localSearch = localSearch.concat(definition.local_key)
        } else {
            localSearch.push(definition.local_key)
        }
        const value = _.property(localSearch)(obj)

        const foreignSearch = (definition.foreign_key instanceof Array) ? definition.foreign_key : [definition.foreign_key]
        const repo = this.orm.getRepositoryByPath(definition.schema)

        return repo.getAllBy(foreignSearch, value)[0]
    }

    _getBelongsToMany(definition, obj) {
        let localSearch = []

        if (definition.local_key instanceof Array) {
            localSearch = localSearch.concat(definition.local_key)
        } else {
            localSearch.push(definition.local_key)
        }
        const value = _.property(localSearch)(obj)

        const foreignSearch = (definition.foreign_key instanceof Array) ? definition.foreign_key : [definition.foreign_key]

        const repo = this.orm.getRepositoryByPath(definition.schema)

        return repo.getAllBy(foreignSearch, value)
    }

    _getHasMany(definition, obj) {
        const localSearch = (definition.local_key instanceof Array) ? definition.local_key : [definition.local_key]

        const value = _.property(localSearch)(obj)

        const foreignSearch = (definition.foreign_key instanceof Array) ? definition.foreign_key : [definition.foreign_key]
        const repo = this.orm.getRepositoryByPath(definition.schema)

        return repo.getAllBy(foreignSearch, value)[0]
    }
}

module.exports = ModelHandler