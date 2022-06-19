/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import React, {useState} from 'react';
import {Button, Form, Jumbotron, Modal, Toast} from 'react-bootstrap';
import './EntryEditor.css';
import {Link, useHistory, useParams} from 'react-router-dom';
import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {useMutation, useQuery} from '@apollo/client';
import {Entry} from './graphql/schema';
import {ENTRY_CREATE_MUTATION, ENTRY_DELETE_MUTATION, ENTRY_UPDATE_MUTATION} from './graphql/mutations';
import {BLOG_BY_HANDLE_QUERY, ENTRY_QUERY} from './graphql/queries';


function randomString(length: number) {
    const allLowerAlpha = [...'abcdefghijklmnopqrstuvwxyz'];
    const allNumbers = [...'0123456789'];
    const base = [...allNumbers, ...allLowerAlpha];
    return [...Array(length)].map(i => base[Math.random() * base.length | 0]).join('');
}

export function EditorWelcome() {
    return <Jumbotron>
        <h1>Welcome to BlogQL!</h1>
        <p>This is where you create a new entry or edit your old ones.</p>
    </Jumbotron>;
}

export function EditorFormViaEntryId() {
    const { handle } = useParams<{handle : string}>(); // get handle param from router route
    const { id } = useParams<{id : string}>(); // get id param from router route
    const {loading, error, data} = useQuery(ENTRY_QUERY, {variables: {handle, id}});
    if (!error && data?.blog.id) {
        return (loading ? <p>Loading...</p> :
            <EditorForm blogId={data.blog.id}
                        id={id}
                        title={data.blog.entry.title}
                        content={data.blog.entry.content}
            />);
    }
    return (<p>An unexpected error has occurred: {error}</p>)
}

export function EditorFormViaBlogHandle() {
    const { handle } = useParams<{handle : string}>(); // get handle param from router route
    const {loading, error, data} = useQuery(BLOG_BY_HANDLE_QUERY, { variables: { handle } });
    if (!error && data?.blog.id) {
        return (loading ? <p>Loading...</p> :
            <EditorForm blogId={data.blog.id} id='' title='' content='' />);
    }
    return (<p>An unexpected error has occurred: {error}</p>)
}

interface EditorFormProps {
    id: string;
    title: string;
    content: string;
    blogId: string
}

export function EditorForm(props: EditorFormProps) {
    const history = useHistory();

    const id = props.id;
    const { handle } = useParams<{handle : string}>(); // get handle param from router route

    const instance = randomString(5);
    const [title, setTitle] = useState(props.title);
    const [content, setContent] = useState(props.content);
    const [valid, setValid] = useState(false);
    const [success, setSuccess] = useState(false);
    const [failure, setFailure] = useState(false);
    const [toast, setToast] = useState('');
    const [deleting, setDeleting] = useState(false);

    let editor: any = null;

    console.log(`${instance} - State: title='${title}' content='${content}' valid=${valid}`);

    const [createEntryMutation] = useMutation<Entry, { blogId: string, title: string, content: string }>(
        ENTRY_CREATE_MUTATION, {variables: {blogId: props.blogId, title, content}});

    function createEntry() {
        createEntryMutation()
            .then(() => {
                setSuccess(true);
                setToast('New entry created');
                setTimeout(() => {
                    history.push('/entries');
                }, 500);
            })
            .catch(() => {
                setFailure(true);
                setToast('Failed to save new entry');
            });
    }

    const [updateEntryMutation] = useMutation<Entry, { id: string, title: string, content: string }>(
        ENTRY_UPDATE_MUTATION, {variables: {id: id!, title: title, content: content}});

    function updateEntry() {
        updateEntryMutation()
            .then(() => {
                setSuccess(true);
                setToast('Entry updated');
                setTimeout(() => {
                    history.push(`/blogs/${handle}`);
                }, 500);
            })
            .catch(() => {
                setFailure(true);
                setToast('Failed to update entry');
            });
    }

    const [deleteEntryMutation] = useMutation<Entry, { id: string }>(
        ENTRY_DELETE_MUTATION, {variables: {id}});

    function deleteEntry() {
        deleteEntryMutation()
            .then(() => {
                setSuccess(true);
                setToast('Entry deleted');
                setTimeout(() => {
                    history.push(`/blogs/${handle}`);
                }, 1000);
            })
            .catch(() => {
                setFailure(true);
                setToast('Failed to delete entry');
            });
    }

    function onTitleChange(event) {
        console.log(`set title = ${event.target.value}`);
        setTitle(event.target.value);
        validateForm();
    }

    function onContentChange(event) {
        console.log(`set content = ${event}`);
        setContent(event);
        validateForm();
    }

    function validateForm() {
        if (title && content && title.length > 0 && content.length > 0) {
            setValid(true);
        } else {
            setValid(false);
        }
    }

    let handleContentFocus = (range, source, theEditor) => {
        // TODO: there must be a better way to obtain a reference to the editor
        editor = theEditor;
    }

    function clearToast() {
        setToast('');
        setSuccess(false);
        setFailure(false);
        setDeleting(false);
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
                <Form.Group controlId='formTitle'>
                    <Form.Label>Title</Form.Label>
                    <Form.Control type='text' value={title} placeholder='Title...' onChange={ onTitleChange} />
                </Form.Group>
                <Form.Group controlId='formContent'>
                    <Form.Label>Content</Form.Label>
                    <ReactQuill theme='snow' value={content} placeholder='Content...'
                                onChange={onContentChange} onFocus={handleContentFocus} />
                </Form.Group>
                <Form.Group>
                    <Button disabled={!valid} onClick={() => {
                        if (id) {
                            updateEntry();
                        } else {
                            createEntry();
                        }
                    }}>Save
                    </Button>
                    <Link to={`/blogs/${handle}`}>
                        <Button>Cancel</Button>
                    </Link>
                </Form.Group>
                <Form.Group>
                    <Button disabled={!id} onClick={() => {
                        setDeleting(true);
                    }}>Delete</Button>
                </Form.Group>
            </Form>

            <Modal show={deleting} onHide={() => { setDeleting(false) }}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Entry</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to do this?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant='secondary' onClick={() => {
                        setDeleting(false);
                    }}>Cancel</Button>
                    <Button variant='danger' onClick={() => {
                        deleteEntry();
                    }}>Yes - Delete</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}



