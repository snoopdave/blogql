/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {LoginButton} from "./common/Authentication";
import React from "react";
import {Heading} from "./common/Heading";

export function Welcome() {
    return <>
        <Heading title='Welcome to BlogQL!' heading='Please login via your favorite Google Account' />
        <LoginButton destination='/blogs'/>
    </>
}