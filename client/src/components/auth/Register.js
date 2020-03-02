import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { registerUser } from '../../actions/authActions';
import TextFieldGroup from '../../components/common/TextFieldGroup';

class Register extends Component {
    constructor(props) {
        super(props); 
    
        this.state = {
             name: '',
             email: '',
             password: '',
             password2: '',
             errors: {}
        }
    }

    componentDidMount() {
        if(this.props.auth.isAuthenticated){
            this.props.history.push('/dashboard');
        }
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.errors){
            this.setState({errors: nextProps.errors});
        }
    }

    handleOnChange = (e) => {
        const { name, value } = e.target;
        this.setState({[name]: value})
    }

    handleOnSubmit = (e) => {
        e.preventDefault();
        const { name, email, password, password2 } = this.state;
        const newUser = { name, email, password, password2 };

        this.props.registerUser(newUser, this.props.history);
    }
    
    render() {
        const { errors } = this.state;
        
        return (
            <div className="register">
                <div className="container">
                <div className="row">
                    <div className="col-md-8 m-auto">
                    <h1 className="display-4 text-center">Sign Up</h1>
                    <p className="lead text-center">Create your DevConnector account</p>
                    <form noValidate onSubmit={this.handleOnSubmit}>
                        <TextFieldGroup
                            placeholder="Name"
                            name="name"
                            value={this.state.name}
                            onChange={this.handleOnChange}
                            error={errors.name}
                        />
                        <TextFieldGroup
                            placeholder="Email Address"
                            name="email"
                            type="email"
                            value={this.state.email}
                            onChange={this.handleOnChange}
                            error={errors.email}
                            info="This site uses Gravatar so if you want a profile image, use a Gravatar email"
                        />
                        <TextFieldGroup
                            placeholder="Password"
                            name="password"
                            type="password"
                            value={this.state.password}
                            onChange={this.handleOnChange}
                            error={errors.password}
                        />
                        <TextFieldGroup
                            placeholder="Confirm Password"
                            name="password2"
                            type="password"
                            value={this.state.password2}
                            onChange={this.handleOnChange}
                            error={errors.password2}
                        />
                        <input type="submit" className="btn btn-info btn-block mt-4" />
                    </form>
                    </div>
                </div>
                </div>
            </div>
        )
    }
}

Register.propTypes = {
    registerUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    auth: state.auth,
    errors: state.errors
});

export default connect(mapStateToProps, { registerUser })(withRouter(Register));
