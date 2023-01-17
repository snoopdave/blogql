/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {Jumbotron} from "react-bootstrap";
import {LoginButton, User} from "./common/Authentication";
import React from "react";

export interface WelcomeProps {
    onLogin: (user: User | null | undefined) => void;
}
export function Welcome(props: WelcomeProps) {
    return <Jumbotron>
        <h1>Welcome to BlogQL!</h1>
        <p>Please login via your favorite Google Account</p>
        <LoginButton onLogin={props.onLogin} destination='/blogs'/>
    </Jumbotron>
}