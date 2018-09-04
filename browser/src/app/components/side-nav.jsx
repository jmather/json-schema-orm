const React = require('react')
const _ = require('underscore')
const Bootstrap = require('react-bootstrap')

const Panel = Bootstrap.Panel
const Button = Bootstrap.Button
const ListGroup = Bootstrap.ListGroup
const ListGroupItem = Bootstrap.ListGroupItem

class SideNavigation extends React.Component {

    setRepository(name) {
        this.props.setRepository(name)
    }

    render() {
        const menuItems = _.map(this.props.orm.getRepositories(), repo => {
            const repoName = repo.getSchema().getName()
            return (<ListGroupItem key={repoName} onClick={() => this.setRepository(repoName)} href={'#'+repoName}>{repo.getSchema().getSingular()}</ListGroupItem>)
        })
        return (
            <Panel>
                <Panel.Heading>Classes</Panel.Heading>
                <Panel.Body>
                    <ListGroup>
                        {menuItems}
                    </ListGroup>
                </Panel.Body>
            </Panel>
        );
    }
}

module.exports = SideNavigation;
