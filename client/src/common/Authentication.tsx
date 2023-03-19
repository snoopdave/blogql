/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import React, {Context, createContext, ReactNode, useContext} from 'react';
import GoogleLogin, {GoogleLoginResponse, GoogleLoginResponseOffline} from 'react-google-login';
import {useNavigate} from "react-router";

export interface User {
    id: string;
    email: string;
    created: string;
    updated?: string;
}

const authContext : Context<UserContext> = createContext<UserContext>({
    user: null
});

interface UserContext {
    user?: User | null;
}

export function useAuth() {
    return useContext(authContext);
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

interface ProvideAuthProps {
    onLogin: (user: User) => void;
    children?: React.ReactNode;
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

interface RequireAuthProps {
    children: ReactNode;
    redirectTo: string;
}

export function RequireAuth(props: RequireAuthProps): JSX.Element {
    let isAuthenticated = useAuth();
    const navigate = useNavigate();
    return (isAuthenticated ? props.children : navigate(props.redirectTo)) as JSX.Element;
}

interface LoginProps {
    destination: string
    onLogin: (user: User | null | undefined) => void;
}

export function LoginButton(props : LoginProps) {
    let auth = useAuth();
    const navigate = useNavigate();
    const cid = process.env.GOOGLE_SIGNON_CID!;

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
            navigate(props.destination);
        } else {
            props.onLogin(null);
            navigate(props.destination);
        }
    };

    return (
        <GoogleLogin clientId={cid}
                     buttonText='Log in with Google'
                     onSuccess={login}
                     onFailure={login}
                     cookiePolicy={'single_host_origin'}
        />
    );
}

export function logout(cb: (message: string) => void) {
    console.log(`Logging out`);
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