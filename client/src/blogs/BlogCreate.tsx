/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import React, {ChangeEvent, useState} from 'react';
import {useMutation} from '@apollo/client';
import {Blog} from '../graphql/schema';
import {BLOG_CREATE_MUTATION} from '../graphql/mutations';
import {Link} from 'react-router-dom';
import {RequireAuth} from "../common/Authentication";
import {useNavigate} from "react-router";
import {BLOGS_QUERY} from "../graphql/queries";
import {Heading} from "../common/Heading";
import {Alert, Button, Form, Input, Space} from "antd";


export interface BlogCreateProps {
    onBlogUpdated: (hasBlog: boolean) => void;
}

export function BlogCreate(props: BlogCreateProps) {
    const [handle, setHandle] = useState('');
    const [name, setName] = useState('');
    const [valid, setValid] = useState(false);
    const [success, setSuccess] = useState(false);
    const [failure, setFailure] = useState(false);
    const [toast, setToast] = useState('');

    const navigate = useNavigate();

    const [blogCreateMutation] = useMutation<Blog, { handle: string | undefined, name: string | undefined }>(BLOG_CREATE_MUTATION, {
        variables: { handle, name },
        refetchQueries: [{query:BLOGS_QUERY}],
    });

    function onHandleChange(event: ChangeEvent<HTMLInputElement>) {
        setHandle(event.target.value.toLowerCase());
        validateForm();
    }

    function onNameChange(event: ChangeEvent<HTMLInputElement>) {
        setName(event.target.value);
        validateForm();
    }

    function validateForm() {
        if (handle && handle.length > 0 && handle.length < 10 && isAlphanumberic(handle)
            && name && name.length > 0 && name.length < 20) {
            setValid(true);
        } else {
            setValid(false);
        }
    }

    function save() {
        blogCreateMutation()
            .then(() => {
                props.onBlogUpdated(true);
                setSuccess(true);
                setToast('New blog created');
                setTimeout(() => {
                    props.onBlogUpdated(true);
                    navigate('/blogs');
                }, 500);
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

            <Form labelCol={{ span: 2 }} wrapperCol={{ span: 24 }}>

                <Form.Item
                    label="Name"
                    name="name"
                    rules={[{ required: true, message: 'Please input a blog name' }]}>
                    <Input onChange={onNameChange} placeholder='My Blog Name' />
                </Form.Item>

                <Form.Item
                    label="Handle"
                    name="handle"
                    rules={[{ required: true, message: 'Please input a plaintext blog handle' }]} >
                    <Input onChange={onHandleChange} placeholder='mybloghandle' />
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 2, span: 12 }}>
                    <Space>
                        <Button disabled={!valid} onClick={() => {
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
