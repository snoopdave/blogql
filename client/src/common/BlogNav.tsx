/*
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {authContext, AuthContext} from './Authentication';
import React, {useContext} from 'react';
import {Menu} from "antd";
import {MenuItemType} from "antd/lib/menu/hooks/useItems";
import {Link} from "react-router-dom";
import {Blog} from "../gql/graphql";
import {useQuery} from "@apollo/client/react/hooks";
import {USER_BLOG_QUERY} from "../graphql/queries";

interface BlogNavProps {
    onBlogUpdated: (blog: Blog | null) => void;
}

export function BlogNav(props: BlogNavProps) {
    const userContext: AuthContext = useContext(authContext);
    let menuItems: MenuItemType[] = [];

    const { loading, error, data } = useQuery(USER_BLOG_QUERY, {
        variables: {
            userId: userContext?.user?.id ? userContext?.user?.id : ''
        }
    });
    if (loading) { return (<p>Loading...</p>); }
    if (error) { return (<p>error!</p>); }
    if (!data) { return (<p>no data!</p>); }

    if (!userContext.user) {
        menuItems = loggedOutMenu();
    } else if (data.blogForUser?.handle) {
        menuItems = hasBlogMenu(data.blogForUser?.handle, userContext);
    } else {
        menuItems = noBlogMenu(userContext);
    }

    console.log(`BlogNav rendering user: ${userContext.user?.email} blog: ${data.blogForUser?.handle}`);
    return (
        <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['2']}
            items={menuItems}
        />
    );
}

function hasBlogMenu(handle: string, userContext: AuthContext) {
    return [
        {label: <Link to={'/blogs'}>Blogs</Link>, key: "create-blog"},
        {label: <Link to={`/blogs/${handle}`}>Blog</Link>, key: "blog"},
        {label: <Link to={`/blogs/${handle}/drafts`}>Drafts</Link>, key: "drafts"},
        {label: <Link to={`/blogs/${handle}/settings`}>Settings</Link>, key: "settings"},
        {label: <Link to='#' onClick={userContext.logout}>Logout</Link>, key: "logout"},
    ];
}

function noBlogMenu(userContext: AuthContext) {
    return [
        {label: <Link to={'/create-blog'}>Create a blog</Link>, key: "create-blog"},
        {label: <Link to='#' onClick={userContext.logout}>Logout</Link>, key: "logout"},
    ];
}

function loggedOutMenu() {
    return  [
        {label: <Link to={'/blogs'}>Blogs</Link>, key: "blogs"},
        {label: <Link to={'/login'}>Login</Link>, key: "login"},
    ];
}