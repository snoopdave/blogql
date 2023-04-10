/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import React, {Context, createContext, ReactNode, useContext, useState} from 'react';
import {useNavigate} from "react-router";
import {Blog, User} from "../gql/graphql";
import {GoogleLogin} from "@react-oauth/google";


// Context will be used  to provide access to user, login and logout within
// subcomponents (instead of passing them down as properties.
export interface AuthContext {
    user?: User | null;
    login: (user: User) => void;
    logout: () => void;
}

export const authContext : Context<AuthContext> = createContext<AuthContext>({
    user: null,
    logout: () => {},
    login: (user: User | null) => {},
});

// ProvideAuth component sets up the AuthContext
interface ProvideAuthProps {
    onLogin: (user: User) => void;
    onLogout: () => void;
    children?: React.ReactNode;
    user?: User | null;
}

export function ProvideAuth(props: ProvideAuthProps) {
    const [user, setUser] = useState(props.user);
    if (!user) {
        checkLoginStatus((user) => {
            setUser(user);
        });
    }
    const contextValue: AuthContext = {
        user,
        login: (user) => {
            setUser(user);
            props.onLogin(user!)
        },
        logout: () => {
            setUser(null);
            props.onLogout();
        },
    };

    return (
        <authContext.Provider value={contextValue}>
            {props.children}
        </authContext.Provider>
    );
}

// RequireAuth component uses AuthContext, redirects if user is not authenticated
interface RequireAuthProps {
    children: ReactNode;
    redirectTo: string;
}

export function RequireAuth(props: RequireAuthProps): JSX.Element {
    let auth = useContext(authContext);
    const navigate = useNavigate();
    return (auth.user ? props.children : <>{navigate(props.redirectTo)}</>) as JSX.Element;
}

export function RequireNoAuth(props: RequireAuthProps): JSX.Element {
    let auth = useContext(authContext);
    const navigate = useNavigate();
    return (!auth.user ? props.children : <>{navigate(props.redirectTo)}</>) as JSX.Element;
}

// LoginButton component shows Google Login button, will redirect when login complete
interface LoginButtonProps {
    destination: string
}

export function LoginButton(props : LoginButtonProps) {
    let userContext = useContext(authContext);
    const navigate = useNavigate();

    return (
        <GoogleLogin
            onSuccess={ async credentialResponse => {
                console.table(credentialResponse);
                if ('credential' in credentialResponse) {
                    const res = await fetch('http://localhost:4000/auth', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        credentials: 'include',
                        body: JSON.stringify({
                            token: credentialResponse.credential
                        }),
                    })
                    userContext.user = await res.json();
                    userContext.login(userContext.user!);
                    navigate(props.destination);
                } else {
                    navigate(props.destination);
                }
            }}
            onError={() => {
                console.log('Login Failed');
            }}
        />
    );
}

// checks login status, calls caller-provided callback with user or null on error.
export function checkLoginStatus(callback: (user: User | null) => void) {
    fetch('http://localhost:4000/me', {
        method: 'GET',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'}
    })
        .then(response => response.json())
        .then(user => {
            callback(user);
        }).catch((error)  => {
        console.log(error);
        callback(null);
    });
}

// logs out of the server-side
export function logout(afterLogout: (message: string) => void) {
    console.log(`Logging out`);
    fetch('http://localhost:4000/logout', {
        method: 'DELETE',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'}
    })
        .then(response => response.json())
        .then(data => {
            afterLogout(data.message);
        });
}
