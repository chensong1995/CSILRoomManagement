import React, { Component } from "react";
import ReactDOM from "react-dom";
import Icon from 'material-ui/Icon';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import IconButton from 'material-ui/IconButton'
import { withStyles, createStyleSheet } from 'material-ui/styles';
import SvgIcon from 'material-ui/SvgIcon';
var Machine = require('../../models/machine.js')
import io from 'socket.io-client';

//Socket.io connection to localhost:3000
var socket = io.connect();

//list of colors to indicate machine availability
//primary = available
//disabled = not available
//error = machine under maintenance
const colors = ["primary", "disabled", "error"];

//list of machines retrieved from database
var machines = window.machines;

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
        this.RenderMachines = this.RenderMachines.bind(this);
    }

    MachineStateChange(){
        console.log(window.machines);
        this.setState({color_indx: (this.state.color_indx+1) % 3});
    }

    componentDidMount(){
        socket.on('MachineColorChange', this.MachineStateChange);
    }

    EmitStateChange(){
        socket.emit("MachineColorChange");
    };

    RenderMachines(){
        return machines.map(csilMachine => {
            return(
                <IconButton>
                    <Icon　color = {colors[this.state.color_indx]} onClick = {this.EmitStateChange.bind(this)}>laptop_chromebook</Icon>
                </IconButton>
            );
        })
    }

    render(){
        return(
            <MuiThemeProvider>
                {this.RenderMachines}
            </MuiThemeProvider>

        );
    }
}

const machine = document.getElementById('machine');
ReactDOM.render(<MachinePage/>, machine);