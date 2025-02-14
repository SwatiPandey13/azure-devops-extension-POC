import { getClient } from "azure-devops-extension-api";
import { CoreRestClient } from "azure-devops-extension-api/Core";
import { GitRestClient } from "azure-devops-extension-api/Git";
import { ReleaseRestClient } from "azure-devops-extension-api/Release";
import { Build, BuildDefinition, BuildQueryOrder, BuildRestClient, BuildStatus, BuildResult } from 'azure-devops-extension-api/Build';
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { ReleaseType } from '../TableData';
import { release } from 'os';
import * as SDK from "azure-devops-extension-sdk";

const BASE_URL="https://dev.azure.com";
const AZURE_ORG = "MSSAP";

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

const fetchLatestCommit = async (commitId:any, repositoryId:any, projectId:any)=> {
    try {
        //const changes = await getClient(BuildRestClient).getBuildChanges(project.name, build.id, undefined, 1);
        const changes = await getClient(GitRestClient).getCommit(commitId, repositoryId, projectId);
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

const fetchRecentBuilds = async (projectId:any, projectName:any)=> {
    try {
        const builds:any = await getClient(BuildRestClient).getBuilds(
            projectId, 
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
            5 ,
            undefined,
            undefined,
            undefined,
            BuildQueryOrder.StartTimeDescending,
            undefined,
            undefined,
            undefined,
            undefined
        );
        return builds;
    } catch(error) {
        console.log(`Error fetching builds for ${projectName}:`, error);
        return [];
    }
    
}

export const getAllPipelinesUsingSdk = async() => {
    try {
        SDK.init();
const projects = await fetchProjects();
    const pipelinesData:any = [];
    const buildPromises = projects.map(async (project:any)=> {
        const builds1 = await fetchRecentBuilds(project.name, project.id);
        const builds = (builds1 !== undefined && builds1.length > 0) ? builds1 : null;
        if (builds !=undefined) {
            const pipelineData = await Promise.all(
                builds.map(async (build:any)=> {
                    const commit = await fetchLatestCommit(build.sourceVersion, build.repository.id,project.id)
                    const latestComment = commit;
                    const reason = build?.reason;
                    const status = build.result;
                    const finalReason = reason;
                    const definitionUrl = `${BASE_URL}/${AZURE_ORG}/${project.name}/_build?definitionId=${build.definition.id}`;
                    return {
                        favorite: new ObservableValue<boolean>(true),
                        lastRunData: {
                        branchName: build.sourceBranch.replace("refs/heads/", ""),
                        branchUrl: build?.repository?.url,
                        endTime: build.finishTime,
                        prId: build.id,
                        prName: latestComment !==null ? latestComment : "Azure Pipeline",
                        releaseType: finalReason as unknown as ReleaseType,
                        startTime: build.startTime,
                        prLink: build?._links?.web?.href
                    },
                    name: build.definition.name,
                    status: BuildResult[status],
                    buildUrl: definitionUrl
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
        console.log(`Error occured while processing pipeline data:${error}`);
    }
}
