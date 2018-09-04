const React = require('react')
const _ = require('underscore')
const Bootstrap = require('react-bootstrap')

const Navbar = Bootstrap.Navbar
const Nav = Bootstrap.Nav
const NavItem = Bootstrap.NavItem
const NavDropdown = Bootstrap.NavDropdown
const MenuItem = Bootstrap.MenuItem

class Navigation extends React.Component {

    setRepository(name) {
        console.log(this.props)
        this.props.setRepository(name)
    }

    render() {
        return (
            <Navbar className="navbar navbar-inverse navbar-fixed-top">
                <a className="navbar-brand" href="#" onClick={() => this.setRepository(null)} >{this.props.projectName}</a>
                <Nav className="nav navbar-nav">
                    <NavItem className="active" onClick={() => this.setRepository(null)} href="#home">Home</NavItem>
                </Nav>
            </Navbar>
        );
    }
}

module.exports = Navigation;
