import React, { Component } from "react";
import ReactDOM from "react-dom";
import Icon from 'material-ui/Icon';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import IconButton from 'material-ui/IconButton'
import { withStyles, createStyleSheet } from 'material-ui/styles';
import {CSSProperties} from "react";
import List, {ListItem, ListItemText} from 'material-ui/List';
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

const styles = {
    img: {
        position: "relative",

    },
};

class MachinePage extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            machines: window.machines,//list of machines retrieved from database
        };
        this.MachineStateChange = this.MachineStateChange.bind(this);
        this.RenderMachines = this.RenderMachines.bind(this);
        this.DetermineMachineColor = this.DetermineMachineColor.bind(this);
    }

    MachineStateChange(machine_indx){
        console.log(machine_indx);
        var machines = this.state.machines;
        machines[indx].available = !machines[indx].available;
        this.setState({machines: machines});
    }

    componentDidMount(){
        socket.on('MachineColorChange', (machine_indx) => {
            var machines = this.state.machines; //Duplicate and modify stored machines on this client
            machines[machine_indx].available = !machines[machine_indx].available;
            this.setState({machines: machines}); //Update state for re-render
        });
        socket.on('MachinesUpdate', new_machine_status => {
            console.log(new_machine_status[16].available);
            this.setState({machines: new_machine_status});
        });
    }

    DetermineMachineColor(availability){
        //list of colors to indicate machine availability
        //primary = available
        //disabled = not available
        //error = machine under maintenance
        if(availability){
            return "primary";
        }
        else{
            return "disabled";
        }
    }

    RenderMachines(){
        return this.state.machines.map((csilMachine, machine_indx) => {
            if(csilMachine.coordinate_x){
                var x = csilMachine.coordinate_x;
                var y = csilMachine.coordinate_y;
                var machine_pos = {
                    position: "absolute",
                    left: x,
                    top: y,
                };
                return(
                    <div key = {csilMachine.id}>
                        <form action = {"/machine/" + csilMachine.id} method = "POST">
                        <IconButton style = {machine_pos} type = "submit" value = "Submit">
                            <Icon color = {this.DetermineMachineColor(csilMachine.available)} onClick = {() => { //On click of an machine
                                socket.emit("MachineColorChange", machine_indx); //Emit a event and notify other clients which machine was clicked
                            }}>laptop_chromebook</Icon>
                        </IconButton>
                        </form>
                    </div>
                );
            }
        })
    }

    render(){
        return(
            <MuiThemeProvider>
                <div style = {styles.img}>
                    <img id = "img" src= "csilMap.png" />
                        <List className = {"Machines"}>
                            {this.RenderMachines()}
                        </List>
                </div>
            </MuiThemeProvider>

        );
    }
}

const machine = document.getElementById('machine');
ReactDOM.render(<MachinePage/>, machine);