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

var styles = {
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
        this.state = {
            rooms: rooms, //list of rooms retrieved from database
        };
    }

    UpdateRoomAvailability(){
        var today = new Date();
        var currentTime = today.getHours + ":" + today.getMinutes();
        rooms.map(room => {
            room.available = "available";
            if(room.isBeingMaintained){
                room.available = "maintaining";
            }
            else{
                records.map(record => {
                    if(record.rid == room.id){
                        if(record.isBatch){ //if record is batch, compare with hours and minutes
                            var currentDate = today.getFullYear() + '-' + today.getMonth() + '-' + today.getDate;
                            if(currentDate >= record.rangeStart && currentDate <= record.rangeEnd){
                                if(currentTime >= record.start && currentTime <= record.end){
                                    room.available = "occupied";
                                }
                            }
                        }
                        else{ //else, compare with full time
                            var startTime = new Date(record.start);
                            var endTime = new Date(record.end);
                            if(Date.parse(today) >= Date.parse(startTime) && Date.parse(today) <= Date.parse(endTime)){
                                room.available = "occupied";
                            }
                        }
                    }
                });
            }
        });
    }

    componentDidMount(){
        socket.on('UpdateRecord', new_booking_records => {
            records = new_booking_records;
            this.UpdateRoomAvailability(rooms);
            this.setState({rooms: rooms});
        })
    };

    DetermineRoomColor(room){
        if(room.available == "available"){
            return "#99ff99";
        }
        else if(room.available == "occupied"){
            return "#ff6666";
        }
        else if(room.available == "maintaining"){
            return "#ffff66";
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
                   cursor: "pointer",
               };

               var txt_posX = (csilRoom.width/2 >= 50)?(csilRoom.width/5):7;
               var txt_posY = (csilRoom.height/2 >= 50)?(csilRoom.height/2):30;
               var txt_size = ((csilRoom.width*csilRoom.height)>=15625)?("20px"):"14px";
               txt_size = ((csilRoom.width*csilRoom.height) >= 36894)?("35px"):txt_size;

               return(
                   <a href ={'/booking/' + csilRoom.number}>
                       <div key = {csilRoom.id}>
                           <label>
                               <svg width={csilRoom.width} height={csilRoom.height} style = {room_pos}>
                                   <g>
                                       <rect width={csilRoom.width} height={csilRoom.height} style={room_style}/>
                                       <text fontFamily="Arial" fontSize = {txt_size} x = {txt_posX} y = {txt_posY} fill = "blue">{csilRoom.number}</text>
                                   </g>
                               </svg>
                           </label>
                       </div>
                   </a>
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

var room = document.getElementById('room');
ReactDOM.render(<Room/>, room);