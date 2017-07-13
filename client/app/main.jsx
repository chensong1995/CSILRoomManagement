import React from "react";
import ReactDOM from "react-dom";

class Layout extends React.Component{
    render(){
        console.log('was here');
        return(
            <h1>hello world</h1>
        );
    }
}

const app = document.getElementById('app');
ReactDOM.render(<Layout/>, app);