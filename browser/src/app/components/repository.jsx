const React = require('react')
const _ = require('underscore')
const Bootstrap = require('react-bootstrap')
const Panel = Bootstrap.Panel
const SchemaViewer = require('react-schema-viewer').default

class Repository extends React.Component {

    render() {
        console.log(this.props.repository.getSchema().schema)

        return (
            <Panel>
                <Panel.Heading>{this.props.repository.getSchema().getSingular()}</Panel.Heading>
                <Panel.Body>
                    <SchemaViewer schema={this.props.repository.getSchema().schema} />
                </Panel.Body>
            </Panel>
        )
    }
}

module.exports = Repository
