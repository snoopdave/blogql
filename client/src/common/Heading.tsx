/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {Jumbotron} from "react-bootstrap";

interface HeadingProps {
    title: String;
    heading: String;
}
export function Heading(props: HeadingProps) {
    return <Jumbotron>
        <h1>{props.title}</h1>
        <p>{props.heading}</p>
    </Jumbotron>;
}