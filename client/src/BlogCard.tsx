import React, {CSSProperties} from "react";
import {Button, Card} from "react-bootstrap";
import {RelativeDateTime} from "./DateTime";
import {Link} from "react-router-dom";

export interface BlogCardProps {
    loggedIn: boolean;
    handle: string;
    title: string;
    content: string;
    entryId: string;
    updated: Date;

}

function BlogCard(props: BlogCardProps) {

    const showIfLoggedIn = () : CSSProperties => {
        if (props.loggedIn) {
            return { 'display': 'block' };
        }
        return { 'display': 'none' };
    };

    return (<Card style={{width: '18em'}} key={props.entryId}>
        <Card.Img variant='top'
                  src={`https://picsum.photos/seed/picsum/215/160?random=${props.entryId}`} />
        <Card.Body>
            <Card.Title>{props.title}</Card.Title>
            <Card.Body>
                <div dangerouslySetInnerHTML={{__html: props.content}}/>
                <RelativeDateTime when={props.updated as Date} />
            </Card.Body>
            <Link style={showIfLoggedIn()} to={`/blogs/${props.handle}/edit/${props.entryId}`}>
                <Button variant='primary'>Edit</Button>
            </Link>
        </Card.Body>
    </Card>);
}

export default BlogCard;