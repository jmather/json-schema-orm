const _ = require('underscore')
const ModelHandler = require('./ModelHandler')
const debug = require('debug')

class Repository {
    /***
     *
     * @param {string} name
     * @param {Schema} schema
     * @param {ORM} orm
     */
    constructor(name, schema, orm) {
        this.name = name
        this.schema = schema
        this.orm = orm
        this.objects = []
        this.indexes = {}
        this.modelHandler = new ModelHandler(this.schema, this.orm)
        this.relationProperties = {}

        this._buildMetaData()
        this._buildIndexes()
    }

    _debug(component) {
        return debug(`Repository:${this.name}:${component}`)
    }

    _buildMetaData() {
        const relations = this.schema.getRelations()
        _.forEach(relations, relation => {
            this.relationProperties[relation.local_property] = relation
        })
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

    /**
     *
     * @returns {string}
     */
    getName() {
        return this.name
    }

    /**
     *
     * @returns {Schema}
     */
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
            this._debug('add', 'setting %s to %o', propName, propValue)
            if (this.relationProperties[propName]) {
                this._debug('add')('Found relation items %s in %s', propName, obj[this.schema.getPrimaryProperty()])
                const relation = this.relationProperties[propName]
                const foreignRepo = this.orm.getRepositoryByPath(relation.schema)

                if (propValue instanceof Array) {
                    this._debug('add')('Adding sub relation %s: %o', propName, propValue)
                    _.forEach(propValue, propValueInstance => {
                        const subObj = _.clone(propValueInstance)

                        subObj[relation.foreign_key] = obj[relation.local_key]
                        this._debug('add')('Adding %s object: %o', foreignRepo.getName(), subObj)
                        foreignRepo.add(subObj)
                    })
                }
            } else {
                model[propName] = propValue
            }
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

    /**
     *
     * @param {Object} matchCriteria
     * @returns {Object}
     */
    getOneBy(matchCriteria) {
        return _.map(_.filter(this.objects, _.matcher(matchCriteria)), o => this._wrap(o))[0]
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