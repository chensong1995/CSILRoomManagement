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
            console.log("was here");
            records = new_booking_records;
            this.UpdateRoomAvailability(rooms);
            this.setState({rooms: rooms});
        })
    };

    DetermineRoomColor(room){
        if(room.available == "available"){
            return "green";
        }
        else if(room.available == "occupied"){
            return "red";
        }
        else if(room.available == "maintaining"){
            return "yellow";
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
               var submitBtn = {
                   display: "none",
               }
               var txt_posX = (csilRoom.width/2 >= 100)?(csilRoom.width/2):20;
               var txt_posY = (csilRoom.height/2 >= 50)?(csilRoom.height/2):30;
               var txt_size = ((csilRoom.width*csilRoom.height)>=15625)?("20px"):"10px";

               return(
                   <div key = {csilRoom.id}>
                       <form action={"/booking/"+csilRoom.number}  method="GET">
                           <label>
                               <input type = "submit" style={submitBtn}/>
                               <button>
                                   <svg width={csilRoom.width} height={csilRoom.height} style = {room_pos}>
                                       <g>
                                           <rect width={csilRoom.width} height={csilRoom.height} style={room_style}/>
                                           <text fontFamily="Arial" fontSize = {txt_size} x = {txt_posX} y = {txt_posY} fill = "blue">{csilRoom.number}</text>
                                       </g>
                                   </svg>
                               </button>
                           </label>
                       </form>
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