import * as React from "react";
import { Header, TitleSize } from "azure-devops-ui/Header";
import { Page, IPageProps, Orientation } from "azure-devops-ui/Page";
import { Card } from "azure-devops-ui/Card";
import { IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";
import * as SDK from "azure-devops-extension-sdk";
import "azure-devops-ui/Core/override.css";
import { showRootComponent } from "../Common";
//import "./iconFont.css";
import TableExample from "./Pipeline";
//import  AzureDevopsPipelines from './getPipelineData';
import { SurfaceBackground, SurfaceContext } from "azure-devops-ui/Surface";
import { CommonServiceIds, getClient, IHostPageLayoutService } from "azure-devops-extension-api";
import { BuildDefinition, BuildRestClient } from "azure-devops-extension-api/Build";


export class HomePage extends React.Component<{}, {}> {
    public componentDidMount() {
         SDK.init();
        /*SDK.register("sample-build-menu", () => {
            return {
                execute: async (context: BuildDefinition) => {
                    console.log("BuildDefinition==");
                    const result = await getClient(BuildRestClient).getDefinition(context.project.id, context.id, undefined, undefined, undefined, true);
                    console.log("result=="+result);
                    const dialogSvc = await SDK.getService<IHostPageLayoutService>(CommonServiceIds.HostPageLayoutService);
                    dialogSvc.openMessageDialog(`Fetched build definition ${result.name}. Latest build: ${JSON.stringify(result.latestBuild)}`, { showCancel: false });
                }
            }
        });*/
    }
    
    public render() : JSX.Element {
        /*return (
            <div style={{width:"100%"}}>
                <Header title="My first extension" titleSize={TitleSize.Large}/>
                <div className="page-content flex-grow" style={{marginTop: "20px", marginLeft: "20px", marginRight: "20px"}}>
                    <Card>Page content</Card>
                    <TableExample />
                </div>
            </div>
        );*/
        return (
        <SurfaceContext.Provider value={{ background: SurfaceBackground.neutral }}>
            <Card>My First Extension For Devops Pipeline</Card>
            <TableExample />
        </SurfaceContext.Provider>
        )
    }
}
export default HomePage;


showRootComponent(<HomePage />);
