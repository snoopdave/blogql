/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {Button, Form, Modal, Toast} from 'react-bootstrap';
import React, {useState} from 'react';
import {useMutation, useQuery} from '@apollo/client';
import {Entry} from './graphql/schema';
import {BLOG_DELETE_MUTATION, BLOG_UPDATE_MUTATION} from './graphql/mutations';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Link, useHistory, useParams} from 'react-router-dom';
import {BLOG_BY_HANDLE_QUERY} from './graphql/queries';


export interface BlogSettingsProps {
    onBlogUpdated: (hasBlog: boolean) => void;
}

export interface BlogSettingsByIdProps {
    id: string;
    name: string;
    onBlogUpdated: (hasBlog: boolean) => void;
}

export function BlogSettings(props: BlogSettingsProps) {
    const { handle } = useParams<{handle : string}>(); // get handle param from router route

    const { loading, error, data } = useQuery(BLOG_BY_HANDLE_QUERY, { variables: { handle } });

    if (loading) {
        return (<p>Loading...</p>);
    }
    if (error) {
        return (<p>error!</p>);
    }
    if (!data) {
        return (<p>no data!</p>);
    }

    return (<BlogSettingsById id={data.blog.id} name={data.blog.name} onBlogUpdated={props.onBlogUpdated} />);
}

export function BlogSettingsById(props: BlogSettingsByIdProps) {
    const [name, setName] = useState(props.name);
    const [valid, setValid] = useState(false);
    const [success, setSuccess] = useState(false);
    const [failure, setFailure] = useState(false);
    const [toast, setToast] = useState('');
    const [deleting, setDeleting] = useState(false);

    const history = useHistory();

    const [blogUpdateMutation] = useMutation<Entry, { id: string, name: string }>(
        BLOG_UPDATE_MUTATION, { variables: { id: props.id, name } });

    const [blogDeleteMutation] = useMutation<Entry, { id: string }>(
        BLOG_DELETE_MUTATION, { variables: { id: props.id } });

    function onNameChange(event) {
        setName(event.target.value);
        validateForm();
    }

    function validateForm() {
        if (name && name.length > 0 && name.length < 20) {
            setValid(true);
        } else {
            setValid(false);
        }
    }

    function save() {
        blogUpdateMutation()
            .then(() => {
                setSuccess(true);
                setToast('Blog updated');
                setTimeout(() => {
                    history.push('/blogs');
                }, 500);
            })
            .catch(() => {
                setFailure(true);
                setToast('Failed to create blog');
            });
    }

    function deleteBlog() {
        blogDeleteMutation()
            .then(() => {
                setSuccess(true);
                setToast('Blog deleted');
                setTimeout(() => {
                    props.onBlogUpdated(false);
                    history.push('/blogs');
                }, 500);
            })
            .catch(() => {
                setFailure(true);
                setToast('Failed to delete blog');
            });
    }

    function clearToast() {
        setToast('');
        setSuccess(false);
        setFailure(false);
        setValid(false); // to disable the save button
    }

    return (
        <>
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

                <Form.Group>
                    <Button variant='danger' onClick={() => {
                        setDeleting(true);
                    }}>Delete Blog</Button>
                </Form.Group>
            </Form>

            <Modal show={deleting} onHide={() => { setDeleting(false) }}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Blog</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to do this?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant='secondary' onClick={() => {
                        setDeleting(false);
                    }}>Cancel</Button>
                    <Button variant='danger' onClick={() => {
                        deleteBlog();
                    }}>Yes - Delete</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
