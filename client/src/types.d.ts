
declare module "babel-plugin-relay/macro" {
    export { graphql as default } from "react-relay";
}

declare global {
    var IS_REACT_ACT_ENVIRONMENT: boolean;
}

export {}
