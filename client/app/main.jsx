import React, { Component } from "react";
import ReactDOM from "react-dom";
import Icon from 'material-ui/Icon';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import IconButton from 'material-ui/IconButton'
import { withStyles, createStyleSheet } from 'material-ui/styles';
import SvgIcon from 'material-ui/SvgIcon';
var Machine = require('../../models/machine.js')
import io from 'socket.io-client';

var socket = io.connect();
const colors = ["primary", "disabled", "error"];

const styleSheet= {
    root: {
        width: '100%',
        maxWidth: '360px'
    }
};

class MachinePage extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            color_indx: 0,
        };
        this.MachineStateChange = this.MachineStateChange.bind(this);
    }

    MachineStateChange(){
        console.log("state change triggered");
        this.setState({color_indx: (this.state.color_indx+1) % 3});
    }

    componentDidMount(){
        socket.on('MachineColorChange', this.MachineStateChange);
    }

    EmitStateChange(){
        socket.emit("MachineColorChange");
    };

    render(){
        return(
            <MuiThemeProvider>
                <IconButton>
                    <Icon　color = {colors[this.state.color_indx]} onClick = {this.EmitStateChange.bind(this)}>laptop_chromebook</Icon>
                </IconButton>
            </MuiThemeProvider>

        );
    }
}

const machine = document.getElementById('machine');
ReactDOM.render(<MachinePage/>, machine);