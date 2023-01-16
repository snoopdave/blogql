/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {Button, Form, Jumbotron, Toast} from 'react-bootstrap';
import React, {ChangeEvent, useState} from 'react';
import {useMutation} from '@apollo/client';
import {Blog} from './graphql/schema';
import {BLOG_CREATE_MUTATION} from './graphql/mutations';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Link, useHistory} from 'react-router-dom';
import {RequireAuth} from "./Authentication";


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

    const history = useHistory();

    const [blogCreateMutation] = useMutation<Blog, { handle: string | undefined, name: string | undefined }>(
        BLOG_CREATE_MUTATION, { variables: { handle, name } });

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
                setSuccess(true);
                setToast('New blog created');
                setTimeout(() => {
                    props.onBlogUpdated(true);
                    history.push('/blogs');
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

            <Jumbotron>
                <h1>Create your blog</h1>
                <p>All you need is a name and a simple text handle that be used in the
                    blog's URL.</p>
            </Jumbotron>

            <Toast show={success} autohide={true} delay={3000}
                   style={{ position: 'absolute', top: 0, right: 0, }} onClose={clearToast} >
                <Toast.Header>
                    <FontAwesomeIcon icon='home' style={{ color: 'green' }} />
                    Success!
                </Toast.Header>
                <Toast.Body>{toast}</Toast.Body>
            </Toast>

            <Toast show={failure} autohide={true} delay={3000}
                   style={{ position: 'absolute', top: 0, right: 0, }} onClose={clearToast} >
                <Toast.Header>
                    <FontAwesomeIcon icon='home' style={{ color: 'red', margin: '1em' }} />
                    Um... not good!
                </Toast.Header>
                <Toast.Body>{toast}</Toast.Body>
            </Toast>

            <Form>
                <Form.Group controlId='formHandle'>
                    <Form.Label>Handle</Form.Label>
                    <Form.Control type='text' value={handle} placeholder='handle...' onChange={onHandleChange} />
                </Form.Group>

                <Form.Group controlId='formName'>
                    <Form.Label>Name</Form.Label>
                    <Form.Control type='text' value={name} placeholder='Name...' onChange={onNameChange} />
                </Form.Group>

                <Form.Group>
                    <Button disabled={!valid} onClick={() => {
                        save();
                    }}>Save</Button>
                    <Link to='/entries'>
                        <Button>Cancel</Button>
                    </Link>
                </Form.Group>
            </Form>

        </RequireAuth>
    );
}

function isAlphanumberic(str: string) {
    return /^[a-zA-Z0-9]+$/.test(str);
}
