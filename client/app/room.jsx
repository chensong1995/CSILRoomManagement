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

var records = window.records; //list of records retrieved from databse
var rooms = window.rooms;

const styles = {
    img: {
        position: "relative",

    },
};

class Room extends React.Component{
    constructor(props){
        super(props);

        this.UpdateRoomAvailability = this.UpdateRoomAvailability.bind(this);
        this.RenderRooms = this.RenderRooms.bind(this);
        this.DetermineRoomColor = this.DetermineRoomColor.bind(this);

        this.UpdateRoomAvailability();
        console.log(rooms);
        this.state = {
            rooms: rooms, //list of rooms retrieved from database
        };
    }

    UpdateRoomAvailability(){
        var today = new Date();
        var currentTime = today.getHours + ":" + today.getMinutes();
        rooms.map(room => {
            if(room.isBeingMaintained){
                room.available = false;
            }
            else{
                records.map(record => {
                    if(record.isBatch){ //if record is batch, compare with hours and minutes
                        var currentDate = today.getFullYear() + '-' + today.getMonth() + '-' + today.getDate;
                        if(currentDate >= record.rangeStart && currentDate <= record.rangeEnd){
                            if(currentTime >= record.start && currentTime <= record.end){
                                room.available = false;
                            }
                        }
                    }
                    else{ //else, compare with full time
                        var startTime = new Date(record.start);
                        var endTime = new Date(record.end);
                        if(Date.parse(today) >= Date.parse(startTime) && Date.parse(today) <= Date.parse(endTime)){
                            room.available = false;
                        }
                    }
                });
            }
        });
    }

    componentDidMount(){
        socket.on('UpdateRecord', new_booking_records => {
            console.log("was here");
            records = new_booking_records;
            this.UpdateRoomAvailability(rooms);
            this.setState({rooms: rooms});
        })
    };

    DetermineRoomColor(room){
        if(room.available){
            return "green";
        }
        else{
            return "red";
        }
    }

    RenderRooms(){
        return this.state.rooms.map((csilRoom) => {
           if(csilRoom.coordinate_x){
               var room_pos = {
                   position: "absolute",
                   left: csilRoom.coordinate_x,
                   top: csilRoom.coordinate_y,
               };
               var room_style = {
                   fill: this.DetermineRoomColor(csilRoom),
                   stroke: "black",
                   strokeWidth: 10,
               };
               return(
                   <div key = {csilRoom.id}>
                       <svg width={csilRoom.width} height={csilRoom.height} style = {room_pos}>
                           <g>
                               <rect width={csilRoom.width} height={csilRoom.height} style={room_style}/>
                               <text fontSize = "20px" x = {0} y = {50} fill = "blue">hello world</text>
                           </g>
                       </svg>
                   </div>
               )
           }
        });
    }

    render(){
        return(
            <MuiThemeProvider>
                <div style = {styles.img}>
                    <img id = "img" src= "csilRoomMap.png" />
                        {this.RenderRooms()}
                </div>
            </MuiThemeProvider>

        );
    }
}

const room = document.getElementById('room');
ReactDOM.render(<Room/>, room);