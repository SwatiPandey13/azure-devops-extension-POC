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
    const allPipelinesData = await getAllPipelinesData();
    console.log("allPipelinesData==", allPipelinesData);
    return allPipelinesData;
  }
  catch (error) {
    throw new Error(`Error occured while processing pipeline data: ${error}`);
  }
}

interface IPipelineLastRun {
  startTime?: Date;
  endTime?: Date;
  prId: number;
  prName: string;
  prLink: string;
  releaseType: ReleaseType;
  branchName: string;
  branchUrl: string;
}

export interface IPipelineItem {
  name: string;
  buildUrl: string;
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
