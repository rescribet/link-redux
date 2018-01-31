import * as React from "react";

import {
    LabelType,
    LinkedPropType,
    SubjectType,
    TopologyType,
} from "../../types";

export interface PropTypes {
    forceRender?: boolean;
    label: LabelType;
    linkedProp: LinkedPropType;
    subject: SubjectType;
}

export interface TopologyContext {
    topology: TopologyType;
}

export abstract class Topology
    extends React.PureComponent<PropTypes> implements React.ChildContextProvider<TopologyContext> {

    protected topology: TopologyType = null;

    public getChildContext(): TopologyContext {
        return {
            topology: this.topology,
        };
    }

    public render() {
        return null;
    }
}
