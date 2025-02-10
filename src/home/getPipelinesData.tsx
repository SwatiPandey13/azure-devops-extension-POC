import React, { useEffect, useState } from 'react'
import * as SDK from "azure-devops-extension-sdk";
import { getClient } from "azure-devops-extension-api";
import { CoreRestClient } from "azure-devops-extension-api/Core";
import { GitRestClient } from "azure-devops-extension-api/Git";
import { ReleaseRestClient } from "azure-devops-extension-api/Release";
import { Build, BuildDefinition, BuildQueryOrder, BuildRestClient, BuildStatus, BuildResult } from 'azure-devops-extension-api/Build';
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { ReleaseType } from '../TableData';
import { release } from 'os';

const fetchProjects = async () => {
    const projects = await getClient(CoreRestClient).getProjects();
    return projects;
}

const fetchBuilds = async (projectId: any) => {
    const builds = await getClient(BuildRestClient).getBuilds(projectId); 
    return builds;
}

const fetchPullRequests = async (projectId:any, repositoryId:any) => {
    const pullRequests = await getClient(GitRestClient).getPullRequests(repositoryId, projectId);
    return pullRequests;
}

const fetchPRDetailsFromBuild = async (build:any) => {
    try {
        if (!build || !build.sourceVersion || !build.repository || !build.repository.id) {
            console.log("No source version or repository found for this build.");
            return null;
        }

        //Extract PR ID from source branch if it's a PR build
        const branch = build.sourceBranch;
            let prId = null;//JSON.stringify(build.id);
            let prName = null;
            if (branch.startsWith("refs/pull/")) {
                prId = branch.split("/")[2]; //Extract PR ID from "refs/pull/123/merge"
            }

            //Fetch PR details from Git API
            if (prId) {
                const pr = await getClient(GitRestClient).getPullRequestById(parseInt(prId), build.repository.id);
                console.log("pr==", pr);
                prName = pr.title; //PR Name
            }

            return { prId, prName };
    } catch(error) {
        console.error("Error fetching PR details:", error);
    }
}

const fetchReleaseTagAndTypeFromBuild = async (projectName:any,build:any) => {
    try {
        const releases = await getClient(ReleaseRestClient).getReleases(
            projectName,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            build.id);
        if (releases.length === 0) {
            console.log("No releases found for this build.");
            return null;
        }

        // Asuming the first linked release is the correct one
        const release = releases[0];
        //const releaseTags = release.tags.length > 0 ? release.tags.join(", ") : "No Tags"; //Tags associated with releases
        const releaseType = release.releaseDefinition.name;
        return releaseType;
    } catch (error) {
         {
            console.error("Error fetching release type:", error);
            return null;
        }
    }
}

const fetchPrNameAndReleaseType = async (project:any, build:any)=> {
    try {
        //const changes = await getClient(BuildRestClient).getBuildChanges(project.name, build.id, undefined, 1);
        const changes = await getClient(GitRestClient).getCommit(build.sourceVersion, build.repository.id, project.id);
        /*if (changes.length > 0) {
            console.log("Latest Comment:", changes[0].message);
            return changes[0].message;
        } else {
            console.log("No comments found for this build.");
            return null;
        }*/
       if (changes.comment) {
            return changes.comment;
        } else {
            console.log("No comments found for this build.");
            return null;
        }
    } catch(error) {
        console.error("Error fetching latest build comment:", error);
        return null;
    }
    
}
export async function getAllPipelinesData() {
    const projects = await fetchProjects();
    const pipelinesData = [];
    //console.log("projects==", JSON.stringify(projects));
    for (const project of projects) {
        const builds = await getClient(BuildRestClient).getBuilds(
            project.id, 
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            5 /*top*/,
            undefined,
            undefined,
            undefined,
            BuildQueryOrder.StartTimeDescending,
            undefined,
            undefined,
            undefined,
            undefined
        );
       
        const buildsArr = await Promise.all(builds.map(async build => {
            //const prObj = await fetchPRDetailsFromBuild(build); 
            const latestComment = await fetchPrNameAndReleaseType(project, build);
            return{
            favorite: new ObservableValue<boolean>(true),
            lastRunData: {
                      branchName: build.sourceBranch.replace("refs/heads/", ""),
                      endTime: build.finishTime,
                      prId: build.id,
                      prName: latestComment !==null ? latestComment : "Azure Pipeline",
                      releaseType: build.reason as unknown as ReleaseType,
                      startTime: build.startTime,
                    },
                    name: build.definition.name,
                    status: BuildResult[build.result],
        }
    }));
     pipelinesData.push(...buildsArr);
    }

    return pipelinesData;
}


