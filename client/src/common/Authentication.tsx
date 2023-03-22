/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import React, {Context, createContext, ReactNode, useContext, useState} from 'react';
import GoogleLogin, {GoogleLoginResponse, GoogleLoginResponseOffline} from 'react-google-login';
import {useNavigate} from "react-router";

export interface User {
    id: string;
    email: string;
    created: string;
    updated?: string;
}

export const authContext : Context<UserContext> = createContext<UserContext>({
    user: null,
    logout: () => {},
    login: (user: User | null) => {},
});

export interface UserContext {
    user?: User | null;
    login: (user: User) => void;
    logout: () => void;
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
    onLogout: () => void;
    children?: React.ReactNode;
}

export function ProvideAuth(props: ProvideAuthProps) {
    const [user, setUser] = useState(null as User | null);
    if (!user) {
        checkLoginStatus((user) => {
            setUser(user);
        });
    }
    const contextValue: UserContext = {
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

interface RequireAuthProps {
    children: ReactNode;
    redirectTo: string;
}

export function RequireAuth(props: RequireAuthProps): JSX.Element {
    let auth = useContext(authContext);
    const navigate = useNavigate();
    return (auth.user ? props.children : <>{navigate(props.redirectTo)}</>) as JSX.Element;
}

interface LoginProps {
    destination: string
}

export function LoginButton(props : LoginProps) {
    let userContext = useContext(authContext);
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
            userContext.user = await res.json();
            userContext.login(userContext.user!);
            navigate(props.destination);
        } else {
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