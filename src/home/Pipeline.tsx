import * as React from "react";
import {
    getStatusIndicatorData,
    IPipelineItem,
    getAllPipelineItems,
    ReleaseType,
    ReleaseTypeText
} from "../TableData";
import "./Table.Example.css";

import { Card } from "azure-devops-ui/Card";
import { Icon, IIconProps } from "azure-devops-ui/Icon";
import { Link } from "azure-devops-ui/Link";
import { Status, StatusSize } from "azure-devops-ui/Status";
import {
    ColumnMore,
    ITableColumn,
    SimpleTableCell,
    Table,
    TwoLineTableCell,
    ColumnSorting,
    SortOrder,
    sortItems,
} from "azure-devops-ui/Table";
import { Ago } from "azure-devops-ui/Ago";
import { Duration } from "azure-devops-ui/Duration";
import { Tooltip } from "azure-devops-ui/TooltipEx";
import { css } from "azure-devops-ui/Util";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { ObservableArray, ObservableValue } from "azure-devops-ui/Core/Observable";
import { Observer } from "azure-devops-ui/Observer";

//let pipelineItemsData: any[] = []; 
console.log("loading msg==");
const pipelinesData: IPipelineItem[] = await getAllPipelineItems();
console.log("loading after api call done:");
console.log("pipelineItems from api==", pipelinesData);

export default class TableExample extends React.Component {
    //public pipelineItemsData: IPipelineItem[] = [];
    public async componentDidMount() {

    }
    public render(): JSX.Element {
        return (
            <Card
                className="flex-grow bolt-table-card"
                contentProps={{ contentPadding: false }}
                titleProps={{ text: "All pipelines" }}
            >
                <Observer itemProvider={this.itemProvider}>
                    {(observableProps: { itemProvider: ArrayItemProvider<IPipelineItem> }) => (
                        <Table<Partial<IPipelineItem>>
                            ariaLabel="Advanced table"
                            behaviors={[this.sortingBehavior]}
                            className="table-example"
                            columns={this.columns}
                            containerClassName="h-scroll-auto"
                            itemProvider={observableProps.itemProvider}
                            showLines={true}
                            onSelect={(event, data) => console.log("Selected Row - " + data.index)}
                            onActivate={(event, row) => console.log("Activated Row - " + row.index)}
                        />
                    )}
                </Observer>
            </Card>
        );
    }

    private columns: ITableColumn<IPipelineItem>[] = [
        {
            id: "name",
            name: "Pipeline",
            renderCell: renderNameColumn,
            readonly: true,
            sortProps: {
                ariaLabelAscending: "Sorted A to Z",
                ariaLabelDescending: "Sorted Z to A",
            },
            width: -33,
        },
        {
            className: "pipelines-two-line-cell",
            id: "lastRun",
            name: "Last run",
            renderCell: renderLastRunColumn,
            width: -46,
        },
        {
            id: "time",
            name: "Duration",
            ariaLabel: "Time and duration",
            readonly: true,
            renderCell: renderDateColumn,
            width: -20,
        },
        /*new ColumnMore(() => {
            return {
                id: "sub-menu",
                items: [
                    { id: "submenu-one", text: "SubMenuItem 1" },
                    { id: "submenu-two", text: "SubMenuItem 2" },
                ],
            } //as unknown as ITableColumn<IPipelineItem>;
        }),*/
    ];

    private itemProvider = new ObservableValue<ArrayItemProvider<IPipelineItem>>(
        new ArrayItemProvider(pipelinesData)
    );

    private sortingBehavior = new ColumnSorting<Partial<IPipelineItem>>(
        (columnIndex: number, proposedSortOrder: SortOrder) => {
            console.log("hi i am from sorting..=", pipelinesData);
            this.itemProvider.value = new ArrayItemProvider(
                sortItems(
                    columnIndex,
                    proposedSortOrder,
                    this.sortFunctions,
                    this.columns,
                    pipelinesData
                )
            );
        }
    );

    private sortFunctions = [
        // Sort on Name column
        (item1: IPipelineItem, item2: IPipelineItem) => {
            return item1.name.localeCompare(item2.name!);
        },
    ];
}

function renderNameColumn(
    rowIndex: number,
    columnIndex: number,
    tableColumn: ITableColumn<IPipelineItem>,
    tableItem: IPipelineItem
): JSX.Element {
    const obj = getStatusIndicatorData(tableItem.status).statusProps;
    console.log("hi="+JSON.stringify(obj));
    return (
        <SimpleTableCell
            columnIndex={columnIndex}
            tableColumn={tableColumn}
            key={"col-" + columnIndex}
            contentClassName="fontWeightSemiBold font-weight-semibold fontSizeM font-size-m"
        >
            <Status
                {...getStatusIndicatorData(tableItem.status).statusProps}
                className="icon-large-margin"
                size={StatusSize.l}
            />

            <div className="flex-row wrap-text">
                <Link 
                className="fontSizeM font-size-m bolt-table-link bolt-table-inline-link no-underline"
                excludeTabStop
                href={tableItem.buildUrl}
                > 
                {tableItem.name}
                </Link>
                
            </div>
        </SimpleTableCell>
    );
}

function renderLastRunColumn(
    rowIndex: number,
    columnIndex: number,
    tableColumn: ITableColumn<IPipelineItem>,
    tableItem: IPipelineItem
): JSX.Element {
    const { prName, prId, releaseType, branchName, prLink, branchUrl } = tableItem.lastRunData;
    const text = "#" + prId + " \u00b7 " + prName;
    const releaseTypeText = ReleaseTypeText({ releaseType: releaseType });
    return (
        <TwoLineTableCell
            className="bolt-table-cell-content-with-inline-link no-v-padding"
            key={"col-" + columnIndex}
            columnIndex={columnIndex}
            tableColumn={tableColumn}
            line1={
                <span className="flex-row wrap-text">
                    <Tooltip text={text} overflowOnly>
                        <Link
                            className="fontSizeM font-size-m bolt-table-link bolt-table-inline-link no-underline"
                            excludeTabStop
                            href={prLink}
                        >
                            {text}
                        </Link>
                    </Tooltip>
                </span>
            }
            line2={
                <span className="fontSize font-size secondary-text flex-row flex-center">
                    {ReleaseTypeIcon({ releaseType: releaseType })}
                     <Tooltip text={releaseTypeText} overflowOnly>
                        <span key="release-type-text" style={{flexShrink: 10}}>
                            {releaseTypeText}
                        </span>
                    </Tooltip>
                    <Tooltip text={branchName} overflowOnly>
                        <Link
                            className="monospaced-text bolt-table-link bolt-table-inline-link no-underline"
                            excludeTabStop
                            href={branchUrl}
                        >
                            {Icon({
                                className: "icon-margin",
                                iconName: "OpenSource",
                                key: "branch-name",
                            })}
                            {branchName}
                        </Link>
                    </Tooltip>
                    {/*<span key="release-type-text" style={{flexShrink: 10}}>
                            {releaseTypeText}
                        </span>
                        <span className="monospaced-text bolt-table-link bolt-table-inline-link">
                        {Icon({
                                className: "icon-margin",
                                iconName: "OpenSource",
                                key: "branch-name",
                            })}
                            {branchName}
                        </span>*/}
                </span>
            }
        />
    );
}

function renderDateColumn(
    rowIndex: number,
    columnIndex: number,
    tableColumn: ITableColumn<IPipelineItem>,
    tableItem: IPipelineItem
): JSX.Element {
    return (
        <TwoLineTableCell
            key={"col-" + columnIndex}
            columnIndex={columnIndex}
            tableColumn={tableColumn}
            line1={WithIcon({
                className: "fontSize font-size",
                iconProps: { iconName: "Calendar" },
                children: (
                    <Ago date={tableItem.lastRunData.startTime!} /*format={AgoFormat.Extended}*/ />
                ),
            })}
            line2={WithIcon({
                className: "fontSize font-size bolt-table-two-line-cell-item wrap-text",
                iconProps: { iconName: "Clock" },
                children: (
                    <Duration
                        startDate={tableItem.lastRunData.startTime!}
                        endDate={tableItem.lastRunData.endTime}
                    />
                ),
            })}
        />
    );
}

function WithIcon(props: {
    className?: string;
    iconProps: IIconProps;
    children?: React.ReactNode;
}) {
    return (
        <div className={css(props.className, "flex-row flex-center")}>
            {Icon({ ...props.iconProps, className: "icon-margin" })}
            {props.children}
        </div>
    );
}

function ReleaseTypeIcon(props: { releaseType: ReleaseType }) {
    let iconName: string = "";
    switch (props.releaseType) {
        case ReleaseType.IndividualCI:
            iconName = "BranchPullRequest";
            break;
        case ReleaseType.BatchedCI:
            iconName = "BranchPullRequest";
            break;
        default:
            iconName = "Tag";
    }

    return Icon({
        className: "bolt-table-inline-link-left-padding icon-margin",
        iconName: iconName,
        key: "release-type",
    });
}
