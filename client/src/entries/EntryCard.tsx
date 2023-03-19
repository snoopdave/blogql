/*
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import React, {CSSProperties} from 'react';
import {RelativeDateTime} from '../common/DateTime';
import {Link} from 'react-router-dom';
import {stripHtml} from 'string-strip-html';

import {Button, List} from "antd";

export interface EntryCardProps {
    loggedIn: boolean;
    handle: string;
    title: string;
    content: string;
    entryId: string;
    updated: Date;

}

function EntryCard(props: EntryCardProps) {

    const showIfLoggedIn = () : CSSProperties => {
        if (props.loggedIn) {
            return { 'display': 'block' };
        }
        return { 'display': 'none' };
    };

    const strippedContent = stripHtml(props.content).result;
    const truncatedContent = strippedContent.length > 150
        ? strippedContent.substring(0, 150) + '...'
        : strippedContent;

    return <List.Item key={props.title}>
        <List.Item.Meta
            title={<Link to={`/blogs/${props.handle}/entries/${props.entryId}`}>{props.title}</Link>}
        />
        <div className='entry-card-content' dangerouslySetInnerHTML={{__html: truncatedContent}}/>
        <i><RelativeDateTime when={props.updated as Date} /></i>
        <Link style={showIfLoggedIn()} to={`/blogs/${props.handle}/edit/${props.entryId}`}>
            <Button type='primary'>Edit</Button>
        </Link>
    </List.Item>;

    {/* (<Card style={{width: '18em'}} key={props.entryId}>
        <Card.Img variant='top'
                  src={`https://picsum.photos/seed/picsum/215/160?random=${props.entryId}`} />
        <Card.Body>
            <Card.Title>
                <Link className='nav-link' to={`/blogs/${props.handle}/entries/${props.entryId}`}>{props.title}</Link>
            </Card.Title>
            <Card.Body>
                <div className='entry-card-content' dangerouslySetInnerHTML={{__html: truncatedContent}}/>
                <i><RelativeDateTime when={props.updated as Date} /></i>
            </Card.Body>
            <Link style={showIfLoggedIn()} to={`/blogs/${props.handle}/edit/${props.entryId}`}>
                <Button variant='primary'>Edit</Button>
            </Link>
        </Card.Body>
    </Card>); */ }
}

export default EntryCard;