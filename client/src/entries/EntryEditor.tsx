/*
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import React, {ChangeEvent, useState} from 'react';
import {useNavigate} from 'react-router';
import {Link, useParams} from 'react-router-dom';

import {Sources} from 'quill';
import ReactQuill, {UnprivilegedEditor} from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import {useMutation, useQuery} from '@apollo/client/react/hooks';

import {Entry} from '../graphql/schema';
import {
    ENTRY_CREATE_MUTATION,
    ENTRY_DELETE_MUTATION,
    ENTRY_PUBLISH_MUTATION,
    ENTRY_UPDATE_MUTATION
} from '../graphql/mutations';
import {BLOG_BY_HANDLE_QUERY, DRAFTS_QUERY, ENTRIES_QUERY, ENTRY_QUERY} from '../graphql/queries';

import {SimpleDateTime} from '../common/DateTime';
import {RequireAuth} from '../common/Authentication';
import {Heading} from '../common/Heading';

import {Alert, Button, Form, Input, Modal, Space} from "antd";
import {useForm} from "antd/lib/form/Form";

// import BlogQL CSS last to ensure it appears at the end of bundle.css
import './EntryEditor.css';

export function EditorWelcome() {
    return <Heading title='Entry editor'
                    heading='This is where you create a new entry or edit your old ones'/>;
}

export function EditorFormViaEntryId() {
    const {handle} = useParams<{ handle: string }>(); // get handle param from router route
    const {id} = useParams<{ id: string }>(); // get id param from router route
    const {loading, error, data} = useQuery(ENTRY_QUERY, {variables: {handle, id}});
    if (!error && data?.blog.id) {
        return (loading ? <p>Loading...</p> :
            <EditorForm blogId={data.blog.id}
                        id={id!}
                        title={data.blog.entry.title}
                        content={data.blog.entry.content}
                        created={data.blog.entry.created}
                        updated={data.blog.entry.updated}
                        published={data.blog.entry.published}
                        publish={!!data.blog.entry.published}
            />);
    }
    return (<>An unexpected error has occurred: {error}</>)
}

export function EditorFormViaBlogHandle() {
    const {handle} = useParams<{ handle: string }>(); // get handle param from router route
    const {loading, error, data} = useQuery(BLOG_BY_HANDLE_QUERY, {variables: {handle}});
    if (!error && data?.blog.id) {
        return (loading ? <p>Loading...</p> :
                <EditorForm
                    blogId={data.blog.id}
                    id=''
                    title=''
                    content=''
                    created={new Date()}
                    updated={new Date()}
                    published={undefined}
                    publish={false}
                />
        );
    }
    return (<>An unexpected error has occurred: {error}</>)
}

interface EditorFormProps {
    id: string;
    title: string;
    content: string;
    blogId: string;
    created: Date;
    updated: Date;
    published: Date | undefined;
    publish: boolean;
}

export function EditorForm(props: EditorFormProps) {
    const navigate = useNavigate();

    const id = props.id;
    const {handle} = useParams<{ handle: string }>(); // get handle param from router route
    if (handle === undefined) {
        return <p>Error loading blog</p>;
    }

    const [title, setTitle] = useState(props.title);
    const [content, setContent] = useState(props.content);
    const [success, setSuccess] = useState(false);
    const [failure, setFailure] = useState(false);
    const [toast, setToast] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [published, setPublished] = useState(props.published);
    const [saved, setSaved] = useState(id !== null && id !== undefined);
    const [valid, setValid] = useState(isValid());

    const [ form ] = useForm();

    // eslint-disable-next-line
    let editor: UnprivilegedEditor | null = null; // assigned a value below in handleContentFocus()

    const [createEntryMutation] = useMutation<Entry, { handle: string, title: string, content: string }>(
        ENTRY_CREATE_MUTATION, {
            variables: {handle, title, content},
            refetchQueries: [{
                query: DRAFTS_QUERY,
                variables: {handle},
            }, {
                query: ENTRIES_QUERY,
                variables: {handle},
            }],
            awaitRefetchQueries: true,
        });

    function createEntry() {
        createEntryMutation()
            .then(() => {
                setSuccess(true);
                setToast('New entry created');
                // setTimeout(() => {
                //    navigate(`/blogs/${handle}`);
                // }, 500);
            })
            .catch(() => {
                setFailure(true);
                setToast('Failed to save new entry');
            });
    }

    const [updateEntryMutation] = useMutation<Entry, { handle: string, id: string, title: string, content: string }>(ENTRY_UPDATE_MUTATION, {
        variables: {handle, id, title, content},
        refetchQueries: [{
            query: DRAFTS_QUERY,
            variables: {handle},
        }, {
            query: ENTRIES_QUERY,
            variables: {handle},
        }],
        awaitRefetchQueries: true,
    });

    function updateEntry() {
        updateEntryMutation()
            .then(() => {
                setSuccess(true);
                setSaved(true);
                setToast('Entry updated');
                // setTimeout(() => {
                //     history.push(`/blogs/${handle}`);
                // }, 500);
            })
            .catch(() => {
                setFailure(true);
                setToast('Failed to update entry');
            });
    }

    const [publishEntryMutation] = useMutation<Entry, { handle: string, id: string, title: string, content: string }>(ENTRY_PUBLISH_MUTATION, {
        variables: {handle, id, title, content},
        refetchQueries: [{
            query: DRAFTS_QUERY,
            variables: {handle},
        }, {
            query: ENTRIES_QUERY,
            variables: {handle},
        }],
        awaitRefetchQueries: true,
    });

    function publishEntry() {
        publishEntryMutation()
            .then((data) => {
                console.table(data);
                //setPublished(new Date());
                setPublished(data.data?.published);
                setSuccess(true);
                setToast('Entry published');
                // setTimeout(() => {
                //     history.push(`/blogs/${handle}`);
                // }, 500);
            })
            .catch(() => {
                setFailure(true);
                setToast('Failed to publish entry');
            });
    }

    const [deleteEntryMutation] = useMutation<Entry, { handle: string, id: string }>(
        ENTRY_DELETE_MUTATION, {
            variables: {handle, id},
            refetchQueries: [{
                query: DRAFTS_QUERY,
                variables: {handle},
            }, {
                query: ENTRIES_QUERY,
                variables: {handle},
            }],
            awaitRefetchQueries: true,
        });

    function deleteEntry() {
        deleteEntryMutation()
            .then(() => {
                setSuccess(true);
                setToast('Entry deleted');
                setTimeout(() => {
                    navigate(`/`);
                }, 1000);
            })
            .catch(() => {
                setFailure(true);
                setToast('Failed to delete entry');
            });
    }

    function cancelDelete() {
        setDeleting(false);
    }

    function onTitleChange(event: ChangeEvent<HTMLInputElement>) {
        setTitle(event.target.value);
        setSaved(false);
        validateForm();
    }

    function onContentChange(value: string) {
        setContent(value);
        setSaved(false);
        validateForm();
    }

    function isValid() {
        return title && content && title.length > 0 && content.length > 0;
    }

    function validateForm() {
        if (isValid()) {
            setValid(true);
        } else {
            setValid(false);
        }
    }

    let handleContentFocus = (range: ReactQuill.Range, source: Sources, theEditor: UnprivilegedEditor) => {
        // TODO: there must be a better way to obtain a reference to the editor
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        editor = theEditor;
    }

    function clearToast() {
        setToast('');
        setSuccess(false);
        setFailure(false);
        setDeleting(false);
    }


    return (
        <RequireAuth redirectTo='/login'>

            <EditorWelcome/>

            <Space direction="vertical" style={{ width: '100%' }}>
            { success && (
                <Alert message={'Success!'} type={'success'} onClose={clearToast}/>
            )}
            </Space>

            <Space direction="vertical" style={{ width: '100%' }}>
            { failure && (
                <Alert message={'Um... not good!'} type={'error'} onClose={clearToast}/>
            )}
            </Space>

            <Form form={form}
                  initialValues={ {title: title, content: content} }
                  labelCol={{ span: 2 }}
                  wrapperCol={{ span: 24 }} >

                <Form.Item label='Title' name='title'>
                    <Input onChange={onTitleChange} placeholder='Title' />
                </Form.Item>

                {props.id.length > 0 && props.created &&
                    <Form.Item label='Created'>
                        <SimpleDateTime when={props.created}/>
                    </Form.Item>
                }
                {props.id.length > 0 && props.updated &&
                    <Form.Item label='Updated'>
                        <SimpleDateTime when={props.updated}/>
                    </Form.Item>
                }
                {props.published &&
                    <Form.Item label='Published'>
                        <SimpleDateTime when={props.published}/>
                    </Form.Item>
                }

                <Form.Item label='Content' name='content'>
                    <ReactQuill theme='snow'
                                value={content} placeholder='Content...'
                                onChange={onContentChange}
                                onFocus={handleContentFocus}/>
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 2, span: 12 }}>
                    <Space>
                    <Button disabled={!valid || saved} onClick={() => {
                        if (id) {
                            updateEntry();
                        } else {
                            createEntry();
                        }
                    }}>Save
                    </Button>

                    { !published &&
                        <Button disabled={!valid} onClick={() => { publishEntry(); }}>Publish </Button>
                    }
                    { saved &&
                        <Link to={`/blogs/${handle}`}> <Button>Done</Button> </Link>
                    }
                    { !saved &&
                        <Link to={`/blogs/${handle}`}> <Button>Cancel</Button> </Link>
                    }
                    </Space>
                </Form.Item>

                <br />
                <Form.Item wrapperCol={{ offset: 2, span: 12 }}>
                { props.id.length > 0 &&
                    <>
                        <p>Deleting an entry is an irreversible action.</p>
                        <Button danger disabled={!id} onClick={() => {
                            setDeleting(true);
                        }}>Delete</Button>
                    </>
                }
                </Form.Item>
            </Form>

            <Modal
                title="Delete Entry"
                visible={deleting}
                onOk={deleteEntry}
                onCancel={cancelDelete}>
                <p>Are you sure you want to do this?</p>
            </Modal>

        </RequireAuth>
    )
}



