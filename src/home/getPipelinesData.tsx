import React, { useEffect, useState } from 'react'
import { getAllPipelinesUsingApi } from "./azure-api-services"; //Using only for local development
import { getAllPipelinesUsingSdk } from './azure-sdk-services';


export async function getAllPipelinesData() {
     //const pipelineData = await getAllPipelinesUsingApi();
     const pipelineData = await getAllPipelinesUsingSdk();
    return pipelineData;
}


