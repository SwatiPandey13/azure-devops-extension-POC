import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";

import "./build-release-hub-group.scss";

import { Header } from "azure-devops-ui/Header";
import { Page } from "azure-devops-ui/Page";

import { showRootComponent } from "../Common";
import { CommonServiceIds, IProjectPageService } from "azure-devops-extension-api";

interface IBuildHubGroup {
    projectContext: any;
}

class BuildHubGroup extends React.Component<{}, IBuildHubGroup> {   

    constructor(props: {}) {
        super(props);
        this.state = { projectContext: undefined };  
    }

    public componentDidMount() {
        try {        
            console.log("Component did mount, initializing SDK...");
            SDK.init();
            
            SDK.ready().then(() => {
                console.log("SDK is ready, loading project context...");
                this.loadProjectContext();
            }).catch((error) => {
                console.error("SDK ready failed: ", error);
            });
        } catch (error) {
            console.error("Error during SDK initialization or project context loading: ", error);
        }
    }

    public render(): JSX.Element {
        return (
            <div>
                <Header title="Custom Build Hub" />
                <div className="page-content">                    
                    <div className="webcontext-section">
                        <h2>Project Context:</h2>
                        <pre>{JSON.stringify(this.state.projectContext, null, 2)}</pre>
                    </div>
                </div>
            </div>
        );
    }   

    private async loadProjectContext(): Promise<void> {
        try {            
            const client = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
            const context = await client.getProject();
            
            this.setState({ projectContext: context });            

            SDK.notifyLoadSucceeded();
        } catch (error) {
            console.error("Failed to load project context: ", error);
        }
    } 
}

showRootComponent(<BuildHubGroup />);