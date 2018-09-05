const _ = require('underscore')
const debug = require('debug')

class ModelHandler {
    constructor(schema, orm) {
        this.schema = schema
        this.orm = orm
        this.overloaded_properties = {}
        this.expressions = {}

        this._buildGetters()
    }

    _buildGetters() {
        this._debug('_buildGetters')('Building...')
        if (! this.schema.getRelations()) {
            return
        }

        _.forEach(this.schema.getRelations(), relation => {
            this.overloaded_properties[relation.local_property] = relation
        })

        _.forEach(this.schema.getProperties(), (propDef, propName) => {
            if (propDef.expression) {
                this.expressions[propName] = propDef
            }
        })
    }

    _debug(component) {
        return debug(`ModelHandler:${this.schema.getName()}:${component}`)
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

        if (this.expressions[property]) {
            this._debug('get')('Returning expression: %s on: %o', this.expressions[property].expression, obj)

            return this._expression(this.expressions[property].expression, obj)
        }

        if (this.overloaded_properties[property]) {
            const definition = this.overloaded_properties[property]

            return this._get(definition, obj)
        }

        return obj[property]
    }

    _expression(js, context) {
        return function() { return eval(js) }.call(context)
    }

    _get(definition, obj) {
        let matchTier = [obj]
        this._debug('_get')('Processing definition: %o', definition)

        _.forEach(definition.joins, join => {
            this._debug('_get')('Processing Join: %o', join)
            const foreignRepo = this.orm.getRepositoryByPath(join.schema)

            matchTier = _.map(matchTier, refObj => {
                if (refObj[join.local_key] === undefined) {
                    return (join.type === 'one') ? null : []
                }
                const search = {}
                search[join.foreign_key] = refObj[join.local_key]
                this._debug('_get')('Searching for: %o', search)

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

            matchTier = _.filter(matchTier, o => !!o)

            matchTier = _.uniq(matchTier, false, o => o.___data___)

            this._debug('_get')('Next match tier: %o', matchTier)
        })

        if (_.all(definition.joins, j => j.type === 'one')) {
            return matchTier[0]
        }

        return matchTier
    }
}

module.exports = ModelHandler