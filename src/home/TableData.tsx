//import * as React from "react";

import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { ISimpleListCell } from "azure-devops-ui/List";
import * as SDK from "azure-devops-extension-sdk";
import { getClient } from "azure-devops-extension-api";
import React, { useEffect, useState } from 'react'
import {
  Build,
  BuildDefinition,
  BuildQueryOrder,
  BuildRestClient,
  BuildStatus,
} from "azure-devops-extension-api/Build";
import {
  IStatusProps,
  Status,
  Statuses,
  StatusSize,
} from "azure-devops-ui/Status";
import {
  ColumnMore,
  ColumnSelect,
  ISimpleTableCell,
  renderSimpleCell,
  TableColumnLayout,
} from "azure-devops-ui/Table";
import {getAllPipelinesData} from "./home/getPipelinesData";

import { css } from "azure-devops-ui/Util";

export interface ITableItem extends ISimpleTableCell {
  name: ISimpleListCell;
  age: number;
  gender: string;
}

export const renderStatus = (className?: string) => {
  return (
    <Status
      {...Statuses.Success}
      ariaLabel="Success"
      className={css(className, "bolt-table-status-icon")}
      size={StatusSize.s}
    />
  );
};

enum PipelineStatus {
  running = "running",
  succeeded = "succeeded",
  failed = "failed",
  warning = "warning",
}

export enum ReleaseType1 {
  prAutomated,
  tag,
  scheduled,
  manual,
}

export enum ReleaseType {
  /**
     * No reason. This value should not be used.
     */
  None = 0,
  /**
   * The build was started manually.
   */
  Manual = 1,
  /**
   * The build was started for the trigger TriggerType.ContinuousIntegration.
   */
  IndividualCI = 2,
  /**
   * The build was started for the trigger TriggerType.BatchedContinuousIntegration.
   */
  BatchedCI = 4,
  /**
   * The build was started for the trigger TriggerType.Schedule.
   */
  Schedule = 8,
  /**
   * The build was started for the trigger TriggerType.ScheduleForced.
   */
  ScheduleForced = 16,
  /**
   * The build was created by a user.
   */
  UserCreated = 32,
  /**
   * The build was started manually for private validation.
   */
  ValidateShelveset = 64,
  /**
   * The build was started for the trigger ContinuousIntegrationType.Gated.
   */
  CheckInShelveset = 128,
  /**
   * The build was started by a pull request. Added in resource version 3.
   */
  PullRequest = 256,
  /**
   * The build was started when another build completed.
   */
  BuildCompletion = 512,
  /**
   * The build was started when resources in pipeline triggered it
   */
  ResourceTrigger = 1024,
  /**
   * The build was triggered for retention policy purposes.
   */
  Triggered = 1967,
  /**
   * All reasons.
   */
  All = 2031
}

function modifyNow(
  days: number,
  hours: number,
  minutes: number,
  seconds: number
): Date {
  const now = new Date();
  const newDate = new Date(now as any);
  newDate.setDate(now.getDate() + days);
  newDate.setHours(now.getHours() + hours);
  newDate.setMinutes(now.getMinutes() + minutes);
  newDate.setSeconds(now.getSeconds() + seconds);
  return newDate;
}

export async function getAllPipelineItems() {
  try {
    // mapPipelineData: any;
    await SDK.init();
    /*const buildClient = getClient(BuildRestClient);
    console.log("buildClient=", buildClient);
    const projectName = SDK.getHost().name;
    console.log("projectName=", projectName);*/
    //const pipelineList = await buildClient.getDefinitions("DevOps_UX_POC");
    const allPipelinesData = await getAllPipelinesData();
    console.log("allPipelinesData==", allPipelinesData);
    return allPipelinesData;
  }
  catch (error) {
    throw new Error(`Error occured while processing pipeline data: ${error}`);
  }
}

export const pipelineItems = [
  {
    favorite: new ObservableValue<boolean>(true),
    lastRunData: {
      branchName: "main",
      endTime: modifyNow(0, -1, 23, 8),
      prId: 482,
      prName: "Added testing for get_service_instance_stats",
      releaseType: ReleaseType.IndividualCI,
      startTime: modifyNow(0, -1, 0, 0),
    },
    name: "enterprise-distributed-service",
    status: PipelineStatus.running,
  },
  {
    favorite: new ObservableValue<boolean>(true),
    lastRunData: {
      branchName: "main",
      endTime: modifyNow(-1, 0, 5, 2),
      prId: 137,
      prName: "Update user service",
      releaseType: ReleaseType.Manual,
      startTime: modifyNow(-1, 0, 0, 0),
    },
    name: "microservice-architecture",
    status: PipelineStatus.succeeded,
  },
  {
    favorite: new ObservableValue<boolean>(false),
    lastRunData: {
      branchName: "main",
      endTime: modifyNow(0, -2, 33, 1),
      prId: 32,
      prName: "Update user service",
      releaseType: ReleaseType.Schedule,
      startTime: modifyNow(0, -2, 0, 0),
    },
    name: "mobile-ios-app",
    status: PipelineStatus.succeeded,
  },
  {
    favorite: new ObservableValue<boolean>(false),
    lastRunData: {
      branchName: "test",
      endTime: modifyNow(0, -4, 4, 17),
      prId: 385,
      prName: "Add a request body validator",
      releaseType: ReleaseType.IndividualCI,
      startTime: modifyNow(0, -4, 0, 0),
    },
    name: "node-package",
    status: PipelineStatus.succeeded,
  },
  {
    favorite: new ObservableValue<boolean>(false),
    lastRunData: {
      branchName: "dev",
      endTime: modifyNow(0, -6, 2, 8),
      prId: 792,
      prName: "Clean up notifications styling",
      releaseType: ReleaseType.IndividualCI,
      startTime: modifyNow(0, -6, 0, 0),
    },
    name: "parallel-stages",
    status: PipelineStatus.failed,
  },
  {
    favorite: new ObservableValue<boolean>(false),
    lastRunData: {
      branchName: "padding-1",
      endTime: modifyNow(-2, 0, 49, 52),
      prId: 283,
      prName: "Add extra padding on cells",
      releaseType: ReleaseType.IndividualCI,
      startTime: modifyNow(-2, 0, 0, 0),
    },
    name: "simple-web-app",
    status: PipelineStatus.warning,
  },
];

interface IPipelineLastRun {
  startTime?: Date;
  endTime?: Date;
  prId: number;
  prName: string;
  releaseType: ReleaseType;
  branchName: string;
}

export interface IPipelineItem {
  name: string;
  status: string;
  lastRunData: IPipelineLastRun;
  favorite: ObservableValue<boolean>;
}

interface IStatusIndicatorData {
  statusProps: IStatusProps;
  label: string;
}

export function getStatusIndicatorData(status: string): IStatusIndicatorData {
  status = status || "";
  status = status.toLowerCase();
  const indicatorData: IStatusIndicatorData = {
    label: "Success",
    statusProps: { ...Statuses.Success, ariaLabel: "Success" },
  };
  switch (status) {
    case PipelineStatus.failed:
      indicatorData.statusProps = { ...Statuses.Failed, ariaLabel: "Failed" };
      indicatorData.label = "Failed";
      break;
    case PipelineStatus.running:
      indicatorData.statusProps = { ...Statuses.Running, ariaLabel: "Running" };
      indicatorData.label = "Running";
      break;
    case PipelineStatus.warning:
      indicatorData.statusProps = { ...Statuses.Warning, ariaLabel: "Warning" };
      indicatorData.label = "Warning";

      break;
  }

  return indicatorData;
}

export function ReleaseTypeText(props: { releaseType: ReleaseType }) {
  /*switch (props.releaseType) {
    case ReleaseType.prAutomated:
      return "PR Automated";
    case ReleaseType.manual:
      return "Manually triggered";
    case ReleaseType.scheduled:
      return "Scheduled";
    default:
      return "Release new-features";
  }*/
 const autoTrigger = [ReleaseType.IndividualCI, ReleaseType.BatchedCI];
 const schedule = [ReleaseType.Schedule, ReleaseType.ScheduleForced];
 if (autoTrigger.includes(props.releaseType)) {
      return "Automatically triggered"
 } else if (ReleaseType.Manual === props.releaseType) {
      return "Manually triggered";
 } else if (schedule.includes(props.releaseType)) {
      return "Scheduled";
 } else {
      return "Release new-features";
 }
}
