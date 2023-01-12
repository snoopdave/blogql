/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {Redirect, Route, useHistory} from 'react-router-dom';
import React, {Context, createContext, useContext} from 'react';
import GoogleLogin, {GoogleLoginResponse, GoogleLoginResponseOffline} from 'react-google-login';
import {RouteProps} from "react-router";
import {GOOGLE_SIGNON_CID} from "./googlecid";

export interface User {
    id: string;
    email: string;
    created: string;
    updated?: string;
}

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
export function PrivateRoute({ children, ...rest }: RouteProps ) {
    const auth = useAuth();
    return (
        <Route
            {...rest}
            // @ts-ignore
            render = { (props) => {
                const storedUser = localStorage.getItem('BlogQlUser');
                if (storedUser) {
                    auth.user = JSON.parse(storedUser);
                } else {
                    auth.user = null;
                }
                return auth.user ? (children) : (
                    <Redirect to={{
                        pathname: '/login',
                        state: {from: props.location}
                    }}
                    />);
                }
            }
        />
    );
}

// For more details on `authContext`, `ProvideAuth`, `useAuth` and `useProvideAuth` concepts
// refer to: https://usehooks.com/useAuth/
const authContext : Context<UserContext> = createContext<UserContext>({
    user: null
});

interface UserContext {
    user?: User | null;
}

export function useAuth() {
    return useContext(authContext);
}

interface ProvideAuthProps {
    onLogin: (user: User) => void;
    children?: React.ReactNode;
}

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
            callback(null);
    });
}

export function ProvideAuth(props: ProvideAuthProps) {
    const auth = useAuth();
    checkLoginStatus((user) => {
        if (user) {
            auth.user = user;
            props.onLogin(user);
        }
    });
    return (
        <authContext.Provider value={auth}>
            {props.children}
        </authContext.Provider>
    );
}

interface LoginProps {
    destination: string
    onLogin: (user: User | null | undefined) => void;
}

export function LoginButton(props : LoginProps) {
    let auth = useAuth();
    const history = useHistory();

    let login = async (googleData: GoogleLoginResponse | GoogleLoginResponseOffline) => {
        if ('tokenId' in googleData) {
            const res = await fetch('http://localhost:4000/auth', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({
                    token: googleData.tokenId
                }),
            })
            auth.user = await res.json();
            props.onLogin(auth.user);
            history.push(props.destination);
        } else {
            props.onLogin(null);
            history.push(props.destination);
        }
    };

    return (
        <GoogleLogin clientId={GOOGLE_SIGNON_CID}
                     buttonText='Log in with Google'
                     onSuccess={login}
                     onFailure={login}
                     cookiePolicy={'single_host_origin'}
        />
    );
}

export function logout(cb: (message: string) => void) {
    fetch('http://localhost:4000/logout', {
        method: 'DELETE',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'}
    })
        .then(response => response.json())
        .then(data => {
            console.log(`logout message: ${data.message}`);
            localStorage.removeItem('BlogQlUser');
            cb(data.message);
        });
}