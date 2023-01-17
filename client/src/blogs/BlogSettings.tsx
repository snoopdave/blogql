/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {Button, Form, Modal, Toast, Tabs, Tab, Jumbotron} from 'react-bootstrap';
import React, {ChangeEvent, useState} from 'react';
import {useQuery, useMutation} from '@apollo/client/react/hooks';
import {Entry} from '../graphql/schema';
import {BLOG_DELETE_MUTATION, BLOG_UPDATE_MUTATION, ISSUE_API_KEY_MUTATION} from '../graphql/mutations';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Link, useParams} from 'react-router-dom';
import {BLOG_BY_HANDLE_QUERY, BLOGS_QUERY} from '../graphql/queries';
import {RequireAuth} from "../common/Authentication";
import {useNavigate} from "react-router";


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
        return (<>Loading...</>);
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
    const [apiKey, setApiKey] = useState('******************');
    const [toast, setToast] = useState('');
    const [deleting, setDeleting] = useState(false);

    const navigate = useNavigate();

    const [blogUpdateMutation] = useMutation<Entry, { id: string, name: string }>(
        BLOG_UPDATE_MUTATION, {
            variables: { id: props.id, name },
            refetchQueries: [{query: BLOGS_QUERY}],
            awaitRefetchQueries: true,
        });

    const [blogDeleteMutation] = useMutation<Entry, { id: string }>(
        BLOG_DELETE_MUTATION, {
            variables: { id: props.id },
            refetchQueries: [{query: BLOGS_QUERY}],
            awaitRefetchQueries: true,
        });

    const [issueApiKeyMutation] = useMutation(ISSUE_API_KEY_MUTATION, { variables: {} })

    function onNameChange(event: ChangeEvent<HTMLInputElement>) {
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
                    navigate('/blogs');
                }, 500);
            })
            .catch(() => {
                setFailure(true);
                setToast('Failed to create blog');
            });
    }

    function issueApiKey() {
        issueApiKeyMutation()
            .then((result) => {
                setApiKey(result.data.issueApiKey);
                setSuccess(true);
                setToast('API key issued');
            }).catch(() => {
                setFailure(true);
                setToast('Error issuing API key');
            });
    }

    function deleteBlog() {
        blogDeleteMutation()
            .then(() => {
                setSuccess(true);
                setToast('Blog deleted');
                setTimeout(() => {
                    props.onBlogUpdated(false);
                    navigate('/blogs');
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
        <RequireAuth redirectTo="/login">

            <Jumbotron>
                <h1>Settings</h1>
                <p>This is where you configure your blog</p>
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

            <Tabs defaultActiveKey='name'>
                <Tab title='Name' eventKey='name'>
                    <Form className='settings'>
                        <Form.Group controlId='formName'>
                            <Form.Label>Name</Form.Label>
                            <Form.Control type='text' value={name} placeholder='Name...' onChange={onNameChange}/>
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
                </Tab>

                <Tab title='API Key' eventKey='apikey'>
                    <Form className='settings'>
                        <Form.Group>
                            <Form.Label>
                                This is where you get your API key. Make sure you save it some where
                                safe because you won't be able to see it here again. If you lose it
                                you'll have to create another one here.
                            </Form.Label>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>
                                <b>API Key</b>: {apiKey}
                            </Form.Label>
                        </Form.Group>
                        <Form.Group>
                            <Button onClick={() => {
                                issueApiKey();
                            }}>Issue API Key</Button>
                        </Form.Group>
                    </Form>
                </Tab>

                <Tab title='Danger' eventKey='danger'>
                    <Form className='settings'>
                        <Form.Group>
                            <p>This is where you delete your entire blog. This is an irreversible action.</p>
                            <Button variant='danger' onClick={() => {
                                setDeleting(true);
                            }}>Delete Blog</Button>
                        </Form.Group>
                    </Form>
                </Tab>
            </Tabs>

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

        </RequireAuth>
    );
}
