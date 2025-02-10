import React, { useEffect, useState } from 'react'
import * as SDK from "azure-devops-extension-sdk";
import { getClient } from "azure-devops-extension-api";
import { Build, BuildDefinition, BuildQueryOrder, BuildRestClient, BuildStatus } from 'azure-devops-extension-api/Build';

const AzureDevopsPipelines = () => {
    const [pipelines, setPipelines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(()=>{
        const initalizeAndFetchPipelines = async () => {
            try {
                 await SDK.init();

                const buildClient = getClient(BuildRestClient);
                console.log("buildClient=",buildClient);
                const projectName = SDK.getHost().name;
                console.log("projectName=",projectName);
                const pipelineList = await buildClient.getDefinitions(projectName);
                console.log("pipelineList=",pipelineList);
                setPipelines(pipelineList);
                setLoading(false);
            }catch(err) {
                setError(err.message);
                setLoading(false);
            }
        }
        initalizeAndFetchPipelines();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error:{error}</div>;

    return (
        <div>
            <h1>Build Pipeline</h1>
            <ul>
                Hello TEST!
               {/* {pipelines.map((pipeline)=>(
                    <li key={pipeline}>
                        {pipeline} (ID: {pipeline})
                    </li>
                ))} */}
            </ul>
        </div>
    );
}

export default AzureDevopsPipelines;
