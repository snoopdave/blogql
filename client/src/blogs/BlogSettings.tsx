/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import React, {ChangeEvent, useContext, useState} from 'react';
import {useMutation, useQuery} from '@apollo/client/react/hooks';
import {Blog, Entry} from '../graphql/schema';
import {BLOG_DELETE_MUTATION, BLOG_UPDATE_MUTATION, ISSUE_API_KEY_MUTATION} from '../graphql/mutations';
import {Link, useParams} from 'react-router-dom';
import {BLOG_BY_HANDLE_QUERY, BLOGS_QUERY, USER_BLOG_QUERY} from '../graphql/queries';
import {authContext, AuthContext, RequireAuth} from "../common/Authentication";
import {useNavigate} from "react-router";
import {Heading} from "../common/Heading";
import {Alert, Button, Form, Input, Modal, Space, Tabs} from "antd";
import {useForm} from "antd/lib/form/Form";


export interface BlogSettingsProps {
    onBlogUpdated: (blog: Blog | null) => void;
}

export function BlogSettings(props: BlogSettingsProps) {
    const { handle } = useParams<{handle : string}>(); // get handle param from router route
    const { loading, error, data } = useQuery(BLOG_BY_HANDLE_QUERY, { variables: { handle } });
    if (loading) { return (<p>Loading...</p>); }
    if (error) { return (<p>error!</p>); }
    if (!data) { return (<p>no data!</p>); }
    return (<BlogSettingsById id={data.blog?.id} name={data.blog?.name}
                              onBlogUpdated={props.onBlogUpdated} />);
}

export interface BlogSettingsByIdProps {
    id: string;
    name: string;
    onBlogUpdated: (blog: Blog | null) => void;
}

export function BlogSettingsById(props: BlogSettingsByIdProps) {
    const userContext: AuthContext = useContext(authContext);
    const [name, setName] = useState(props.name);
    const [valid, setValid] = useState(false);
    const [success, setSuccess] = useState(false);
    const [failure, setFailure] = useState(false);
    const [toast, setToast] = useState('');
    const [deleting, setDeleting] = useState(false);

    const navigate = useNavigate();

    const [ nameForm ] = useForm();
    const [ apiKeyForm ] = useForm();

    const [blogUpdateMutation] = useMutation<Entry, { id: string, name: string }>(
        BLOG_UPDATE_MUTATION, {
            variables: { id: props.id, name },
            refetchQueries: [{query: BLOGS_QUERY}],
            awaitRefetchQueries: true,
        });

    const [blogDeleteMutation] = useMutation<Entry, { id: string }>(
        BLOG_DELETE_MUTATION, {
            variables: { id: props.id },
            refetchQueries: [
                {query:BLOGS_QUERY},
                {query: USER_BLOG_QUERY, variables: { userId: userContext.user?.id }}],
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
                    clearToast();
                }, 1000);
            })
            .catch(() => {
                setFailure(true);
                setToast('Failed to update blog');
            });
    }

    function issueApiKey() {
        issueApiKeyMutation()
            .then((result) => {
                apiKeyForm.setFieldsValue({apiKey: result.data.issueApiKey});
                setSuccess(true);
                setToast('API key issued. Save it somewhere safe, you won\'t be able to see it again.');
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
                    navigate('/blogs');
                    props.onBlogUpdated(null);
                }, 1000);
            })
            .catch(() => {
                setFailure(true);
                setToast('Failed to delete blog');
            });
    }

    function cancelDelete() {
        setDeleting(false);
    }

    function clearToast() {
        setToast('');
        setSuccess(false);
        setFailure(false);
        setValid(false); // to disable the save button
    }

    const tabItems = [
        {key: 'name', label: 'Name', children:
            <Form form={nameForm} initialValues={ {name: name}}>
                <Form.Item label="Name" name='name'
                    rules={[{ required: true, message: 'Please input a blog name' }]} >
                    <Input onChange={onNameChange} />
                </Form.Item>
                <Button disabled={!valid} onClick={() => { save(); }}>Save</Button>
                <Link to='/entries'> <Button>Cancel</Button> </Link>
            </Form>
        },

        {key: 'apikey', label: 'API Key', children:
           <Form form={apiKeyForm} initialValues={ {apiKey: '*******************'} }>
                <p>This is where you get an API key for accessing your blog via GraphQL.
                   If you have lost it you'll have to create another one here.</p>
                <Form.Item label="API Key" name="apiKey">
                    <Input />
                </Form.Item>
                <Button onClick={() => { issueApiKey(); }}>Issue API Key</Button>
            </Form>
        },

        {key: 'delete', label: 'Delete blog', children:
            <>
                <p>You can delete your blog here. This is an irreversible action.</p>
                <Button danger onClick={() => { setDeleting(true); }}>Delete Blog</Button>
            </>
        },
    ];

    return (
        <RequireAuth redirectTo="/login">

            <Heading title='Settings' heading='This is where you configure your blog' />

            <Space direction="vertical" style={{ width: '100%' }}>
            { success && (
                <Alert message={toast} type={'success'} onClose={clearToast} showIcon />
            )}
            </Space>

            <Space direction="vertical" style={{ width: '100%' }}>
            { failure && (
                <Alert message={toast} type={'error'} onClose={clearToast} showIcon />
            )}
            </Space>

            <Tabs defaultActiveKey="name" items={tabItems} />

            <Modal
                title="Delete Blog"
                open={deleting}
                onOk={deleteBlog}
                onCancel={cancelDelete}>
                <p>Are you sure you want to do this?</p>
            </Modal>

        </RequireAuth>
    );
}
