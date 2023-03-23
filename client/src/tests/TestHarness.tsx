/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */
import {ApolloProvider} from "@apollo/client";
import {client} from "../setupTests";
import {ProvideAuth} from "../common/Authentication";
import {Routes} from "react-router";
import React from "react";
import {User} from "../graphql/schema";

function onLogin() {
    console.log('Login');
}

function onLogout() {
    console.log('Logout');
}

const user: User = {
    created: new Date().toDateString(), email: "testy@example.com", id: "bleepblort"
}

interface TestHarnessProps {
    loggedIn: boolean;
    children?: React.ReactNode;
}

export function TestHarness(props: TestHarnessProps) {
    if (props.loggedIn) {
        return <ApolloProvider client={client}>
            <ProvideAuth user={user} onLogin={onLogin} onLogout={onLogout}>
                <Routes>
                    {props.children}
                </Routes>
            </ProvideAuth>
        </ApolloProvider>
    }
    return <ApolloProvider client={client}>
        <Routes>
            {props.children}
        </Routes>
    </ApolloProvider>
}