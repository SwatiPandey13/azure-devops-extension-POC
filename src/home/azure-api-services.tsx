import React, { useEffect, useState } from 'react'
import * as SDK from "azure-devops-extension-sdk";
import { getClient } from "azure-devops-extension-api";
import { Build, BuildDefinition, BuildQueryOrder, BuildRestClient, BuildResult, BuildStatus } from 'azure-devops-extension-api/Build';
import axios from "axios";
import { ObservableValue } from 'azure-devops-ui/Core/Observable';
import { ReleaseType } from '../TableData';

/*
We use access token & azure api service only for local development, for prod we use azure SDK to fetch devops data.
*/

const BASE_URL="https://dev.azure.com";
const AZURE_ORG = "Voya-Projects";
const AZURE_PROJECT = "DevOps_UX_POC";
const PAT = "PsoUSqlKnxL050yKVfnMX4l6XPPTYfoC5vN8qMoT1LEflXzbA9YDJQQJ99BAACAAAAAdXslUAAASAZDOJs4P";

const getHeaders = () => ({
        Authorization: `Basic ${btoa(":"+PAT)}`,
        "Content-Type": "application/json",
})

const fetchProjects = async ()=> {
    try {
        const projectUrl = `https://dev.azure.com/${AZURE_ORG}//_apis/projects?api-version=7.1-preview.4`;
        console.log("url=",projectUrl);
        const response = await axios.get(projectUrl, { headers: getHeaders() });
        const projects = response.data.value;
        return projects;
    }catch(error) {
        console.log("error==", error);
    }
}
const fetchRecentBuilds = async (projectName:any) => {
    try {
        const buildUrl = `https://dev.azure.com/${AZURE_ORG}/${projectName}/_apis/build/builds?$top=5&api-version=7.1-preview.7`;
        
        const response = await axios.get(buildUrl, { headers: getHeaders() });
        //console.log("response==", response);
        if (response.data.value.length > 0) {
           // console.log("response==", response);
            return response.data.value; 
        }
       
    } catch(error) {
        console.log(`Error fetching builds for ${projectName}:`, error);
        return [];
    }
    
}


const getLatestCommit = async (projectId:any, repositoryId:any, commitId:any) => {
    const API_URL = `https://dev.azure.com/${AZURE_ORG}/${projectId}/_apis/git/repositories/${repositoryId}/commits/${commitId}?api-version=7.1-preview.1`;
     try {
        const response = await axios.get(API_URL, { headers: getHeaders() });
        const res = response.data;
        return (res !==undefined) ? res : null;
     }catch(error) {
        console.log(`Error fetching latest commit for ${repositoryId}:`, error);
        return null;
     }
}
 
export async function getAllPipelinesUsingApi() {
try {
    
    //const url = `https://dev.azure.com/${AZURE_ORG}/${AZURE_PROJECT}/_apis/pipelines?api-version=7.1-preview.1`;
    
   // const url = `https://vsrm.azure.com/${AZURE_ORG}/${AZURE_PROJECT}/_apis/release/releases?api-version=7.1-preview.1`;
    
    const projects = await fetchProjects();
    const pipelinesData:any = [];
    const buildPromises = projects.map(async (project:any)=> {
        const builds1 = await fetchRecentBuilds(project.name);
        const builds = (builds1 !== undefined && builds1.length > 0) ? builds1 : null;
        if (builds !=undefined) {
            const pipelineData = await Promise.all(
                builds.map(async (build:any)=> {
                    const commit = await getLatestCommit(project.id, build.repository.id, build.sourceVersion)
                    const latestComment = commit?.comment
                    const reason = build?.reason;
                    const status = build.result.charAt(0).toUpperCase()+build.result.slice(1)
                    const finalReason = reason.charAt(0).toUpperCase()+reason.slice(1);
                    const definitionUrl = `${BASE_URL}/${AZURE_ORG}/${project.name}/_build?definitionId=${build.definition.id}`;
                    console.log("finish time==", new Date(build.finishTime))
                    return {
                        favorite: new ObservableValue<boolean>(true),
                        lastRunData: {
                        branchName: build?.sourceBranch.replace("refs/heads/", ""),
                        branchUrl: build?.repository?.url,
                        endTime: new Date(build.finishTime),
                        prId: build.id,
                        prName: latestComment !==null ? latestComment : "Azure Pipeline",
                        releaseType: finalReason as unknown as ReleaseType,
                        startTime: new Date(build.startTime),
                        prLink: build?._links?.web?.href
                    },
                    name: build.definition.name,
                    buildUrl: definitionUrl, 
                    status: status,
                    }
                })
            )
           return pipelineData;
        }
        
    });
    const buildsResult = await Promise.all(buildPromises);
    const filteredBuilds = buildsResult.filter((item)=> item !== undefined).flat();
    console.log("filteredBuilds==", filteredBuilds);
    return filteredBuilds;
} catch(error) {
    console.log("error=",error);
}

}
