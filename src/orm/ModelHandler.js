const _ = require('underscore')

class ModelHandler {
    constructor(schema, orm) {
        this.schema = schema
        this.orm = orm
        this.overloaded_properties = {}

        this._buildGetters();
    }

    _buildGetters() {
        if (! this.schema.orm.relations) {
            return
        }

        _.forEach(this.schema.orm.relations, relation => {
            this.overloaded_properties[relation.local_property] = relation
        })
    }

    /**
     *
     * @param {Object} obj
     * @param {string} property
     */
    get(obj, property) {
        if (property === '___proxy___') {
            return this
        }

        if (property === 'toJSON') {
            return () => obj;
        }

        if (this.overloaded_properties[property]) {
            const definition = this.overloaded_properties[property]

            if (definition.type === 'has_one') {
                return this._getHasOne(definition, obj)
            }

            if (definition.type === 'has_many') {
                return this._getHasMany(definition, obj)
            }
        }

        return obj[property]
    }

    _getHasOne(definition, obj) {
        let localSearch = []
        if (definition.local_property) {
            localSearch.push(definition.local_property)
        }

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

    _getHasMany(definition, obj) {

    }
}

module.exports = ModelHandler