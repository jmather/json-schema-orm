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

    _debug(component) {
        return require('debug')(`ModelHandler:${this.schema.getName()}:${component}`)
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

        if (property === '___data___') {
            return obj
        }

        if (property === 'toJSON') {
            return () => obj
        }

        if (this.overloaded_properties[property]) {
            const definition = this.overloaded_properties[property]

            if (definition.type === 'one' || definition.type === 'many') {
                return this._get(definition, obj)
            }
        }

        return obj[property]
    }

    _getOne(definition, obj) {
        return this._getMany(definition, obj)[0]
    }

    _getMany(definition, obj) {
        const repo = this.orm.getRepositoryByPath(definition.schema)

        const search = {}
        search[definition.foreign_key] = obj[definition.local_key]

        this._debug('_getMany')('search: %o', search)
        return repo.getAllBy(search)
    }

    _get(definition, obj) {
        this._debug('_get')('Getting first match tier: %o', definition)
        let matchTier = this._getMany(definition, obj)

        this._debug('_get')('First match tier: %o', matchTier)

        if (matchTier.length === 0) {
            return []
        }

        if (definition.type === 'one') {
            matchTier = [matchTier[0]]
        }

        _.forEach(definition.joins, join => {
            const foreignRepo = this.orm.getRepositoryByPath(join.schema)

            matchTier = _.map(matchTier, refObj => {
                const search = {}
                search[join.foreign_key] = refObj[join.local_key]

                switch(join.type) {
                    case 'one':
                        return foreignRepo.getOneBy(search)
                    case 'many':
                        return foreignRepo.getAllBy(search)
                }
            })

            if (join.type === 'many') {
                matchTier = _.flatten(matchTier)
            }

            matchTier = _.uniq(matchTier, false, o => o.___data___)

            this._debug('_get')('Next match tier: %o', matchTier)
        })

        if (definition.type === 'one') {
            return matchTier[0]
        }

        return matchTier
    }
}

module.exports = ModelHandler