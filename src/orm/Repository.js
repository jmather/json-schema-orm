const _ = require('underscore')
const ModelHandler = require('./ModelHandler')

class Repository {
    /***
     *
     * @param {string} name
     * @param {{ orm: { singular: string, plural: string, primary_property: string }}} schema
     * @param {ORM} orm
     */
    constructor(name, schema, orm) {
        this.name = name
        this.schema = schema
        this.orm = orm
        this.objects = []
        this.indexes = {}
        this.modelHandler = new ModelHandler(this.schema, this.orm)

        this._buildIndexes()
    }

    _buildIndexes() {
        const primaryKey = this.schema.getPrimaryProperty()
        this.primaryIndex = {
            type: 'primary',
            properties: [primaryKey],
            values: {}
        }
        this.indexes[primaryKey] = this.primaryIndex
    }

    _index(obj) {
        _.forEach(this.indexes, index => {
            const values = []
            _.forEach(index.properties, property => {
                values.push(_.property(property)(obj))
            })
            index.values[values.join('_')] = obj
        })
    }

    _wrap(obj) {
        return new Proxy(obj, this.modelHandler)
    }

    getName() {
        return this.name
    }

    getSchema() {
        return this.schema
    }

    getAll() {
        return _.map(this.objects, o => this._wrap(o))
    }

    add(obj) {
        if (obj.___handler___ && obj.___handler___ instanceof ModelHandler) {
            return null
        }

        const model = this._wrap({})

        _.forEach(obj, (propValue, propName) => {
            model[propName] = propValue
        })

        this.objects.push(model)
        this._index(model)

        return obj
    }

    get(id) {
        if (! this.primaryIndex.values[id]) {
            return null
        }

        return this._wrap(this.primaryIndex.values[id])
    }

    /**
     *
     * @param {Object} matchCriteria
     * @returns {Object[]}
     */
    getAllBy(matchCriteria) {
        return _.map(_.filter(this.objects, _.matcher(matchCriteria)), o => this._wrap(o))
    }

    getByIndex(indexName, value) {
        if (! this.indexes[indexName]) {
            throw new Error(`Repository ${this.name} does not have index ${indexName}`)
        }

        const result = this.indexes[indexName].values[value]

        return (result instanceof Array) ? result : [result]
    }
}

module.exports = Repository