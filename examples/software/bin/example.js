#!/usr/bin/env node
const path = require('path')
const JSORM = require('../../../src/orm/index')
const _ = require('underscore')

const projectSchemasFile = path.resolve(__dirname, '..', 'bundle/schemas.json')
const dataPath = path.resolve(__dirname, '..', 'data')

const loader = new JSORM.Loader()

const orm = loader.loadSchemas(projectSchemasFile)

loader.loadData(dataPath)

// returns: { name: 'Core API', reposiotry: { name: 'Core Project' } }
console.log(JSON.stringify(orm.getRepository('component').get('Core API')))

// returns: [{"name":"Core UI","repository":{"name":"Core Project"},"depends_on":[{"child_component_name":"Core API"}]}]
console.log(JSON.stringify(orm.getRepository('component').getAllBy(['repository', 'name'], 'Core Project')))

// returns: {"name":"Core Project","type":"git","checkout":{"web":"http://example.com/site.git","ssh":"ssh://git@example.com/site.git"}}
console.log(JSON.stringify(orm.getRepository('component').get('Core API').repository))

// returns: TBD...
console.log(JSON.stringify(orm.getRepository('repository').get('Core Project').components))

// returns: TBD...
console.log(JSON.stringify(orm.getRepository('component').get('Core UI').depends_on))
