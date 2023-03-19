/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {LoginButton, User} from "./common/Authentication";
import React from "react";
import {Heading} from "./common/Heading";

export interface WelcomeProps {
    onLogin: (user: User | null | undefined) => void;
}
export function Welcome(props: WelcomeProps) {
    return <>
        <Heading title='Welcome to BlogQL!' heading='Please login via your favorite Google Account' />
        <LoginButton onLogin={props.onLogin} destination='/blogs'/>
    </>
}