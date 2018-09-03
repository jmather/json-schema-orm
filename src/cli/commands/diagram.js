const tools = require('../../tools')
const cli = require('cli')
const path = require('path')
const _ = require('underscore')
const fs = require('fs')
const convertDot = require('../../visualization/convert-dot')



cli.main((args, options) => {
    const JS_ORM = require('../../orm/index')
    const _ = require('underscore')

    const projectSchemasFile = path.resolve(options.project, 'bundle/schemas.json')
    const dataPath = path.resolve(options.project, 'data')

    const loader = new JS_ORM.Loader()

    const orm = loader.loadSchemas(projectSchemasFile)

    loader.loadData(dataPath)

    const dotTemplate = ' digraph {\n' +
        'node[shape=record,style=filled,fillcolor=gray95]\n' +
        'pad=0.2;\n' +
        'ranksep=1\n' +
        'edge[arrowtail=empty]\n' +
        '\n' +
        '\n\n__SCHEMAS__\n\n__RELATIONS__\n}'

    const models = buildModels(orm)
    const relations = buildRelations(orm)

    const dotString = dotTemplate.replace('__SCHEMAS__', models).replace('__RELATIONS__', relations)

    console.log(dotString)

    fs.writeFileSync('test.dot', dotString)

    convertDot.dotToPng(dotString).then(png => {
        fs.writeFileSync('test.png', png)
    })
})

function buildRelations(orm) {
    const repositories = orm.getRepositories()

    const relationStrings = _.map(repositories, repository => {
        const schema = repository.getSchema()
        const relations = _.sortBy(schema.getRelations(), r => r.local_property)

        const propStrings = _.map(relations, relation => {
            const schemaName = orm.getRepositoryByPath(_.last(relation.joins).schema).getSchema().getName()

            return `${schema.getName()} -> ${schemaName} [label="${relation.local_property}   "]`
        })

        return propStrings
    })

    const relations = _.uniq(_.flatten(relationStrings))

    return relations.join('\n')
}

function buildModels(orm) {
    const repositories = orm.getRepositories()

    const models = _.map(repositories, repository => {
        const schema = repository.getSchema()

        const props = {}
        _.forEach(schema.getProperties(), (propValue, propName) => {
            props[propName] = _.clone(propValue)
            props[propName].__type__ = 'prop'
        })

        _.forEach(schema.getRelations(), (relValue) => {
            props[relValue.local_property] = _.clone(relValue)
            props[relValue.local_property].__type__ = 'rel'
        })


        const keys = _.sortBy(_.keys(props), p => p)

        const propStrings = _.map(keys, key => {
            const prop = props[key]
            if (prop.__type__ === 'rel') {
                const many = _.all(prop.joins, j => j.type === 'one') ? '' : '[]'
                const type = orm.getRepositoryByPath(_.last(prop.joins).schema).getSchema().getSingular()
                return `+ ${key} (${type}${many})`
            }

            return `+ ${key} (${prop.type})`
        })

        return `${schema.getName()}[label = "{${schema.getSingular()}| ${propStrings.join(' \\l ')}\\l}"]`
    })

    return models.join('\n')
}
