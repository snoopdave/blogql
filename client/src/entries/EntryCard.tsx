/*
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import React, {CSSProperties} from 'react';
import {Button, Card} from 'react-bootstrap';
import {RelativeDateTime} from '../common/DateTime';
import {Link} from 'react-router-dom';
import {stripHtml} from 'string-strip-html';

import './EntryCard.css';

export interface BlogCardProps {
    loggedIn: boolean;
    handle: string;
    title: string;
    content: string;
    entryId: string;
    updated: Date;

}

function EntryCard(props: BlogCardProps) {

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

    return (<Card style={{width: '18em'}} key={props.entryId}>
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
    </Card>);
}

export default EntryCard;