#!/usr/bin/env node

const path = require('path')
const JS_ORM = require('../../../index')
const _ = require('underscore')

const projectSchemasFile = path.resolve(__dirname, '..', 'bundle/schemas.json')
const dataPath = path.resolve(__dirname, '..', 'data')

const loader = new JS_ORM.Loader()

const orm = loader.loadSchemas(projectSchemasFile)

loader.loadData(dataPath)

// simple get
// returns: { name: 'Core API', reposiotry: { name: 'Core Project' } }
console.log(JSON.stringify(orm.getRepository('component').get('Core API')))

// match get
// returns: [{"name":"Core UI","repository":{"name":"Core Project"},"depends_on":[{"child_component_name":"Core API"}]}]
console.log()
console.log(JSON.stringify(orm.getRepository('component').getAllBy('repository_name', 'Core Project')))

//// has_one
//// returns: {"name":"Core Project","type":"git","checkout":{"web":"http://example.com/site.git","ssh":"ssh://git@example.com/site.git"}}
//console.log(JSON.stringify(orm.getRepository('component').get('Core API').repository))
//
//// belongs_to_many
//// returns: [{"name":"Core API","repository":{"name":"Core Project"}},{"name":"Core UI","repository":{"name":"Core Project"},"depends_on":[{"child_component_name":"Core API"}]}]
//console.log(JSON.stringify(orm.getRepository('repository').get('Core Project').components))
//
//// has_and_belongs_to_many
//// returns: TBD...
//console.log(JSON.stringify(orm.getRepository('component').get('Core UI').depends_on))
