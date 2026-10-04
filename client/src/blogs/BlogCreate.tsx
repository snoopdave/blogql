/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import React, {ChangeEvent, useContext, useState} from 'react';
import {useMutation} from '@apollo/client';
import {BLOG_CREATE_MUTATION} from '../graphql/mutations';
import {Link} from 'react-router-dom';
import {authContext, AuthContext, RequireAuth} from "../common/Authentication";
import {useNavigate} from "react-router";
import {Heading} from "../common/Heading";
import {Alert, Button, Form, Input, Space} from "antd";
import {BLOGS_QUERY, USER_BLOG_QUERY} from "../graphql/queries";
import {Blog, BlogCreateInput} from "../gql/graphql";
import {BlogRef} from "../App";


export interface BlogCreateProps {
    onBlogUpdated: (blog: BlogRef | null) => void;
}

export function BlogCreate(props: BlogCreateProps) {
    const userContext: AuthContext = useContext(authContext);
    const [handle, setHandle] = useState('');
    const [name, setName] = useState('');
    const [valid, setValid] = useState(false);
    const [success, setSuccess] = useState(false);
    const [failure, setFailure] = useState(false);
    const [toast, setToast] = useState('');

    const[blog, setBlog] = useState({ name, handle });

    const navigate = useNavigate();

    const [blogCreateMutation] = useMutation<Blog, { blog: BlogCreateInput }>(BLOG_CREATE_MUTATION, {
        variables: { blog },
        refetchQueries: [
            {query: BLOGS_QUERY},
            {query: USER_BLOG_QUERY, variables: { userId: userContext.user?.id }}],
        awaitRefetchQueries: true,
    });

    function onHandleChange(event: ChangeEvent<HTMLInputElement>) {
        const nextHandle = event.target.value.toLowerCase();
        setHandle(nextHandle);
        setBlog({ name, handle: nextHandle });
        validateForm(name, nextHandle);
    }

    function onNameChange(event: ChangeEvent<HTMLInputElement>) {
        const nextName = event.target.value;
        setName(nextName);
        setBlog({ name: nextName, handle });
        validateForm(nextName, handle);
    }

    function validateForm(nextName: string, nextHandle: string) {
        setValid(nextHandle.length > 0 && nextHandle.length < 10 && isAlphanumberic(nextHandle)
            && nextName.length > 0 && nextName.length <= 20);
    }

    function save() {
        blogCreateMutation()
            .then((data) => {
                setSuccess(true);
                setToast('New blog created');
                setTimeout(() => {
                    navigate('/blogs');
                    const newBlog: BlogRef = { handle: handle, name: name, }
                    console.table(data.data);
                    console.table(newBlog);
                    props.onBlogUpdated(newBlog);
                }, 1000);
            })
            .catch(() => {
                setFailure(true);
                setToast('Failed to create blog');
            });
    }

    function clearToast() {
        setToast('');
        setSuccess(false);
        setFailure(false);
        setValid(false); // to disable the save button
    }

    return (
        <RequireAuth redirectTo="/login">

            <Heading title='Create your blog'
                     heading='All you need is a name and a simple text handle (aka "slug") that will be used in the blog URL.' />

            { success && (
                <Alert message={'Success!'} type={'success'} onClose={clearToast}/>
            )}

            { failure && (
                <Alert message={'Um... not good!'} type={'error'} onClose={clearToast}/>
            )}

            <Form layout="vertical" className="blog-form">

                <Form.Item
                    label="Name"
                    name="name"
                    rules={[{ required: true, message: 'Please input a blog name' }]}>
                    <Input maxLength={20} onChange={onNameChange} placeholder='My Blog Name' />
                </Form.Item>

                <Form.Item
                    label="Handle"
                    name="handle"
                    rules={[{ required: true, message: 'Please input a plaintext blog handle' }]} >
                    <Input onChange={onHandleChange} placeholder='mybloghandle' />
                </Form.Item>

                <Form.Item>
                    <Space wrap>
                        <Button type="primary" disabled={!valid} onClick={() => {
                            save();
                        }}>Save</Button>
                        <Link to='/blogs'>
                            <Button>Cancel</Button>
                        </Link>
                    </Space>
                </Form.Item>
            </Form>

        </RequireAuth>
    );
}

function isAlphanumberic(str: string) {
    return /^[a-zA-Z0-9]+$/.test(str);
}
