const tools = require('../tools')
const cli = require('cli')
const Ajv = require('ajv')
const glob = require('glob')
const path = require('path')
const refResolver = require('json-schema-ref-parser')
const ajv = new Ajv();

cli.parse(null, ['meta-schemas', 'schemas', 'data'])

cli.main((args, options) => {
    let hadError = false,
        schemaPath = null,
        schemas = null,
        validator = null,
        root = null,
        oldCwd = null,
        schema = null

    switch (cli.command) {
        case 'meta-schemas':
            schemaPath = tools.root('meta-schemas') + '/**.yaml'
            schemas = glob.sync(schemaPath)

            schemas.forEach(schemaFile => {
                const schema = tools.loadYAML(schemaFile)
                cli.info(`checking ${schemaFile}...`)

                if (! ajv.validateSchema(schema)) {
                    cli.error(`Error processing ${chemaFile}`)
                    cli.error(tools.prettyJSON(ajv.errors))
                    hadError = true
                }
            })

            if (hadError) {
                process.exit(1)
            }

            cli.ok('All schemas confirmed')
            break
        case 'schemas':
            root = tools.root('meta-schemas')

            refResolver.dereference(`${root}/json-schema-orm.schema.yaml`).then(metaSchema => {
//                console.log(tools.prettyJSON(metaSchema));
//                schema.allOf.push({ $ref: 'http://json-schema.org/draft-07/schema' })

                schemaPath = path.resolve(tools.root(options), 'schemas') + '/**.yaml'
//                console.log(schemaPath)
                schemas = glob.sync(schemaPath)

                schemas.forEach(schemaFile => {
                    const schema = tools.loadYAML(schemaFile)
                    cli.info(`checking ${schemaFile}...`)
                    if (! ajv.validate(metaSchema, schema)) {
                        cli.error(`Error processing ${schemaFile}`)
                        cli.error(tools.prettyJSON(ajv.errors))
                        hadError = true
                    }
                })

                if (hadError) {
                    process.exit(1)
                }

                cli.ok('All schemas confirmed')

            }).catch(e => {
                cli.error(e)
            })

            break

        case 'data':
            root = path.resolve(tools.root(options), 'schemas')

            const dataPath = path.resolve(tools.root(options), 'data') + '/**/**.yaml'
//            console.log(schemaPath)
            const datas = glob.sync(dataPath)

            const promises = datas.map(dataFile => {
                const schemaFile = path.resolve(root, path.basename(dataFile).split('.').splice(-2, 1) + '.schema.yaml')

                return refResolver.dereference(schemaFile).then(metaSchema => {
                    cli.info(`checking ${path.basename(dataFile)} against ${path.basename(schemaFile)}...`)
                    const data = tools.loadYAML(dataFile)
                    if (!ajv.validate(metaSchema, data)) {
                        cli.error(`Error processing ${schemaFile}`)
                        cli.error(tools.prettyJSON(ajv.errors))
                        hadError = true
                    }
                }).catch(e => {
                    cli.error(e)
                })
            })

            Promise.all(promises).then(() => {
                if (hadError) {
                    process.exit(1)
                }

                cli.ok('All schemas confirmed')
            })

            break

    }
})
