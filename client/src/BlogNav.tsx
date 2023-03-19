/*
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {useAuth} from './common/Authentication';
import {useQuery} from '@apollo/client';
import {USER_BLOG_QUERY} from './graphql/queries';
import React from 'react';
import {Menu} from "antd";
import {MenuItemType} from "antd/lib/menu/hooks/useItems";
import {Link} from "react-router-dom";

interface BlogNavProps {
    onLogout: () => void;
}

export function BlogNav(props: BlogNavProps) {
    const auth = useAuth();

    const { loading, error, data } = useQuery(USER_BLOG_QUERY, {
        variables: {
            userId: auth?.user?.id ? auth?.user?.id : ''
        }
    });
    if (loading) {
        return (<p>Loading...</p>);
    }
    if (error) {
        return (<p>error!</p>);
    }
    if (!data) {
        return (<p>no data!</p>);
    }

    let menuItems: MenuItemType[] = [];

    if (!error && data?.blogForUser) { // logged-in user with a blog (one blog per user for now)
        const handle: string = data.blogForUser.handle;
        menuItems = [
            {label: <Link to={'/blogs'}>Blogs</Link>, key: "create-blog"},
            {label: <Link to={`/blogs/${handle}`}>Blog</Link>, key: "blog"},
            {label: <Link to={`/blogs/${handle}/drafts`}>Drafts</Link>, key: "drafts"},
            {label: <Link to={`/blogs/${handle}/settings`}>Settings</Link>, key: "settings"},
            {label: <Link to={`/logout`}>Logout</Link>, key: "logout"},
        ];

    } else if (auth?.user?.id) { // logged-in user without a blog
        menuItems = [
            {label: <Link to={'/create-blog'}>Create a blog</Link>, key: "create-blog"},
            {label: <Link to={'/logout'}>Logout</Link>, key: "logout"},
        ];

    } else { // not logged-in
        menuItems = [
            {label: <Link to={'/blogs'}>Blogs</Link>, key: "blogs"},
            {label: <Link to={'/login'}>Login</Link>, key: "login"},
        ];
    }
    return (
        <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['2']}
            items={menuItems}
        />
    );
}